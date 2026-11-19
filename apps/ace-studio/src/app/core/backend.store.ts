/**
 * @module backend-store
 * @remarks Read-only server readiness and explicit model initialization.
 * @public
 */
import { Injectable, inject, signal } from "@angular/core";
import { BackendClient } from "./backend.client";
import { safeBackendMessage } from "./backend-error";
import { BackendHealth, BackendStats, ModelInventory } from "./api.types";
import { ConnectionStore } from "./connection.store";

/** @public Shared connection status for studio UI. */
@Injectable({ providedIn: "root" })
export class BackendStore {
  private readonly api = inject(BackendClient);
  private readonly connection = inject(ConnectionStore);
  private requestSequence = 0;
  /** @public Active connection test state. */
  readonly busy = signal(false);
  /** @public Last successful service info, or null if unavailable. */
  readonly health = signal<BackendHealth | null>(null);
  /** @public Server-advertised model capabilities. */
  readonly inventory = signal<ModelInventory | null>(null);
  /** @public Backend-provided statistics, null when not exposed. */
  readonly stats = signal<BackendStats | null>(null);
  /** @public Last connection or loading error. */
  readonly error = signal<string | null>(null);

  /**
   * @public Read service status without implicitly triggering model downloads.
   */
  async refresh(): Promise<void> {
    const sequence = ++this.requestSequence;
    const revision = this.connection.revision();
    const current = () => sequence === this.requestSequence
      && revision === this.connection.revision();
    this.busy.set(true);
    this.error.set(null);
    try {
      const [health, inventory] = await Promise.all([
        this.api.health(), this.api.models()
      ]);
      if (!current()) return;
      this.health.set(health);
      this.inventory.set(inventory);
      try {
        const stats = await this.api.stats();
        if (current()) this.stats.set(stats);
      } catch {
        if (current()) this.stats.set(null);
      }
    } catch (error: unknown) {
      if (!current()) return;
      this.health.set(null);
      this.inventory.set(null);
      this.stats.set(null);
      this.error.set(safeBackendMessage(error));
    } finally {
      if (sequence === this.requestSequence) this.busy.set(false);
    }
  }

  /** @public Request explicit model loading, then refresh observed status. */
  async load(name: string, languageModel?: string): Promise<void> {
    if (this.busy()) return;
    const revision = this.connection.revision();
    let success = false;
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.api.initializeModel(name, languageModel);
      success = true;
    } catch (error: unknown) {
      if (revision === this.connection.revision()) {
        this.error.set(safeBackendMessage(error));
      }
    } finally {
      this.busy.set(false);
    }
    if (success && revision === this.connection.revision()) await this.refresh();
  }
}



