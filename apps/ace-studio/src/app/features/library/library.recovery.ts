/**
 * @module library-recovery
 * @remarks Explicit backup-before-reset for unreadable local metadata catalogs.
 * @public
 */
import { Injectable, OnDestroy, inject, signal } from "@angular/core";
import { LibraryPersistence } from "./library.persistence";

/** @public User-driven, nonautomatic corruption recovery; never deletes valid data. */
@Injectable({ providedIn: "root" })
export class LibraryRecoveryService implements OnDestroy {
  private readonly persistence = inject(LibraryPersistence);
  private pendingRaw: string | null = null;
  readonly corrupt = signal(false);
  readonly armed = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  constructor() {
    this.refresh();
    window.addEventListener("storage", this.storageChanged);
  }

  private storageChanged = (event: StorageEvent): void => {
    if (event.key === null || event.key === "ace-studio:library:v1") this.refresh();
  };

  /** @public Recheck corrupt state without replacing local content. */
  refresh(): void {
    try {
      const raw = this.persistence.readCorruptSnapshot();
      this.corrupt.set(raw !== null);
      this.armed.set(false);
      this.pendingRaw = null;
      this.error.set(null);
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Cannot access local catalog.");
    }
  }

  /** @public Download the exact unreadable local data as a text backup. */
  downloadRaw(): void {
    try {
      const raw = this.persistence.readCorruptSnapshot();
      if (raw === null) throw new Error("No unreadable catalog was found.");
      const url = URL.createObjectURL(new Blob([raw], {
        type: "text/plain;charset=utf-8"
      }));
      const element = document.createElement("a");
      element.href = url;
      element.download = "ace-studio-unreadable-catalog.txt";
      document.body.append(element);
      element.click();
      element.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      this.message.set("Unreadable catalog backup requested.");
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Cannot export backup.");
    }
  }

  /**
   * @public Double-confirm an exact corrupt snapshot before removal.
   * @remarks A changed or now-valid snapshot cannot be deleted by this flow.
   */
  reset(): void {
    this.error.set(null);
    this.message.set(null);
    try {
      const raw = this.persistence.readCorruptSnapshot();
      if (raw === null) throw new Error("Catalog is valid or empty; no reset is needed.");
      if (!this.armed() || this.pendingRaw !== raw) {
        this.pendingRaw = raw;
        this.armed.set(true);
        return;
      }
      this.persistence.discardCorruptSnapshot(raw);
      this.pendingRaw = null;
      this.armed.set(false);
      this.corrupt.set(false);
      this.message.set("Unreadable catalog cleared. You can now create projects.");
    } catch (error: unknown) {
      this.armed.set(false);
      this.pendingRaw = null;
      this.error.set(error instanceof Error ? error.message : "Recovery was refused.");
    }
  }

  /** @public Release cross-tab observation when the service is disposed. */
  ngOnDestroy(): void {
    window.removeEventListener("storage", this.storageChanged);
  }
}
