/**
 * @module connection-store
 * @remarks Nonpersistent API credentials; only the endpoint is saved on this device.
 * @public
 */
import { Injectable, signal } from "@angular/core";
import { normalizeEndpoint } from "./api-decoder";

/**
 * @public Preserve a draft credential only while its server address is unchanged.
 * @remarks A partial URL edit also clears the previous server's credential.
 * @returns The previous draft token only for the identical address.
 */
export function credentialAfterEndpointEdit(
  previousDraft: string, nextDraft: string, draftToken: string
): string {
  return previousDraft === nextDraft ? draftToken : "";
}

/** @public Session-scoped connection configuration shared by all features. */
@Injectable({ providedIn: "root" })
export class ConnectionStore {
  private static readonly key = "ace-studio:endpoint:v1";
  /** @public Validated backend base URL. */
  readonly endpoint = signal("http://127.0.0.1:8001");
  /** @public Session-only API key, never written to browser storage. */
  readonly apiKey = signal("");
  /** @public Monotonically increasing generation of backend identity and credentials. */
  readonly revision = signal(0);
  /** @public Distinguishes a selected standalone FastAPI profile. */
  readonly profile = signal<"standalone">("standalone");

  constructor() {
    try {
      const saved = localStorage.getItem(ConnectionStore.key);
      if (saved) this.endpoint.set(normalizeEndpoint(saved));
    } catch {
      // Restricted storage mode: in-memory defaults still work.
    }
  }

  /**
   * @public Update endpoint and clear any previous server's credential.
   * @throws Error if the URL is not safe for a credentialed connection.
   */
  setEndpoint(value: string): void {
    const normalized = normalizeEndpoint(value);
    if (normalized !== this.endpoint()) {
      this.apiKey.set("");
      this.revision.update(value => value + 1);
    }
    this.endpoint.set(normalized);
    try { localStorage.setItem(ConnectionStore.key, normalized); } catch { /* optional */ }
  }

  /** @public Replace session credential, explicitly without persistence. */
  setApiKey(value: string): void {
    const key = value.trim();
    if (key !== this.apiKey()) this.revision.update(current => current + 1);
    this.apiKey.set(key);
  }
}

