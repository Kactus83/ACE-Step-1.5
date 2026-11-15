/**
 * @module backend-store
 * @remarks Read-only server readiness and explicit model initialization.
 * @public
 */
import { Injectable, inject, signal } from "@angular/core";
import { BackendClient } from "./backend.client";
import { BackendHealth, ModelInventory } from "./api.types";

/** @public Shared connection status for studio UI. */
@Injectable({ providedIn: "root" })
export class BackendStore {
  private readonly api = inject(BackendClient);
  /** @public Active connection test state. */
  readonly busy = signal(false);
  /** @public Last successful service info, or null if unavailable. */
  readonly health = signal<BackendHealth | null>(null);
  /** @public Server-advertised model capabilities. */
  readonly inventory = signal<ModelInventory | null>(null);
  /** @public Last connection or loading error. */
  readonly error = signal<string | null>(null);

  /**
   * @public Read service status without implicitly triggering model downloads.
   */
  async refresh(): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      const health = await this.api.health();
      this.health.set(health);
      try {
        this.inventory.set(await this.api.models());
      } catch (error: unknown) {
        this.inventory.set(null);
        throw error;
      }
    } catch (error: unknown) {
      this.health.set(null);
      this.error.set(error instanceof Error ? error.message : "Backend unavailable.");
    } finally {
      this.busy.set(false);
    }
  }

  /** @public Request explicit model loading, then refresh observed status. */
  async load(name: string): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.api.initializeModel(name);
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Model initialization failed.");
    } finally {
      this.busy.set(false);
    }
    await this.refresh();
  }
}
