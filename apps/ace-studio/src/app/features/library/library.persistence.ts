/**
 * @module library-persistence
 * @remarks Synchronize metadata-only projects across tabs without silent stale saves.
 * @public
 */
import { Injectable, OnDestroy } from "@angular/core";
import { decodeLibraryCatalog, encodeLibraryCatalog } from "./library.codec";
import { LibraryProject } from "./library.types";

const KEY = "ace-studio:library:v1";
const MAX_BYTES = 1_500_000;

/**
 * @public Reject a stale snapshot before attempting to replace local data.
 * @throws Error when another tab or process has altered the underlying value.
 * @remarks This is a best-effort check, not an atomic compare-and-swap primitive.
 */
export function assertCatalogSnapshot(
  lastSeen: string | null, current: string | null
): void {
  if (lastSeen !== current) {
    throw new Error("The project catalog changed in another tab. Review updates before saving.");
  }
}

/** @public Browser localStorage adapter; rejects corrupt snapshots and stale writes. */
@Injectable({ providedIn: "root" })
export class LibraryPersistence implements OnDestroy {
  private lastSeen: string | null = null;
  private onUpdate: ((projects: readonly LibraryProject[]) => void) | null = null;
  private onError: ((message: string) => void) | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorage);
    }
  }

  private decode(value: string | null): readonly LibraryProject[] {
    if (value === null) return [];
    const parsed: unknown = JSON.parse(value);
    return decodeLibraryCatalog(parsed);
  }

  /** @public Decode the currently stored catalog without overwriting invalid data. */
  load(): readonly LibraryProject[] {
    const raw = localStorage.getItem(KEY);
    const projects = this.decode(raw);
    this.lastSeen = raw;
    return projects;
  }

  /** @public Subscribe to external tab changes and storage corruption alerts. */
  listen(
    onUpdate: (projects: readonly LibraryProject[]) => void,
    onError: (message: string) => void
  ): void {
    this.onUpdate = onUpdate;
    this.onError = onError;
  }

  private handleStorage = (event: StorageEvent): void => {
    if (event.key !== KEY && event.key !== null) return;
    try {
      const latest = localStorage.getItem(KEY);
      const projects = this.decode(latest);
      this.lastSeen = latest;
      this.onUpdate?.(projects);
    } catch {
      this.onError?.("Another tab wrote an invalid catalog. It has not been overwritten.");
    }
  };

  /**
   * @public Write metadata only when localStorage still matches the last known snapshot.
   * @throws Error on conflict, quota, corrupt storage, or unavailable localStorage.
   */
  save(projects: readonly LibraryProject[]): void {
    const current = localStorage.getItem(KEY);
    const observed = this.lastSeen;
    if (current !== observed) {
      try {
        const latest = this.decode(current);
        this.lastSeen = current;
        this.onUpdate?.(latest);
      } catch {
        throw new Error("Stored catalog is corrupt; export or recover it before writing.");
      }
      assertCatalogSnapshot(observed, current);
    }
    const serialized = JSON.stringify(encodeLibraryCatalog(projects));
    if (new TextEncoder().encode(serialized).byteLength > MAX_BYTES) {
      throw new Error("Project catalog exceeds its 1.5 MB storage policy.");
    }
    localStorage.setItem(KEY, serialized);
    this.lastSeen = serialized;
  }

  /**
   * @public Return an unreadable raw snapshot without altering localStorage.
   * @returns The corrupt source text or null when the catalog is valid or empty.
   */
  readCorruptSnapshot(): string | null {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return null;
    try { this.decode(raw); return null; }
    catch { return raw; }
  }

  /**
   * @public Discard an unchanged, confirmed corrupt catalog only.
   * @throws Error if data changed, became valid or cannot be cleared.
   * @remarks Destructive action belongs only to explicit two-click UI recovery.
   */
  discardCorruptSnapshot(expected: string): void {
    const current = localStorage.getItem(KEY);
    if (current === null || current !== expected) {
      throw new Error("Stored catalog changed. Restart the recovery confirmation.");
    }
    try { this.decode(current); }
    catch {
      localStorage.removeItem(KEY);
      this.lastSeen = null;
      this.onUpdate?.([]);
      return;
    }
    throw new Error("The catalog is valid and cannot be discarded by recovery.");
  }

  /** @public Release event listeners for isolated tests and app destruction. */
  ngOnDestroy(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", this.handleStorage);
    }
  }
}
