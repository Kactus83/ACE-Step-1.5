/**
 * @module dataset-store
 * @remarks One server-owned dataset; all late responses are tied to connection identity.
 * @public
 */
import { Injectable, inject, signal } from "@angular/core";
import { ConnectionStore } from "../../core/connection.store";
import { DatasetClient } from "./dataset.client";
import { assertSampleUnchanged } from "./dataset-edit.guard";
import {
  DatasetOverview, DatasetSample, SaveDatasetRequest, ScanDatasetRequest, UpdateSampleRequest
} from "./dataset.contracts";

/** @public Shared dataset state with serialized writes and stale-response suppression. */
@Injectable({ providedIn: "root" })
export class DatasetStore {
  private readonly client = inject(DatasetClient);
  private readonly connection = inject(ConnectionStore);
  private generation = 0;
  readonly overview = signal<DatasetOverview | null>(null);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  private token(): string {
    return this.connection.revision() + ":" + this.generation;
  }

  private async snapshot(token: string): Promise<void> {
    const overview = await this.client.samples();
    if (token === this.token()) this.overview.set(overview);
  }

  private async perform<T>(
    task: () => Promise<T>,
    onSuccess: (result: T, token: string) => Promise<void> | void
  ): Promise<boolean> {
    if (this.busy()) return false;
    const token = this.token();
    this.busy.set(true);
    this.error.set(null);
    this.message.set(null);
    try {
      const result = await task();
      if (token !== this.token()) return false;
      await onSuccess(result, token);
      return token === this.token();
    } catch (error: unknown) {
      if (token === this.token()) {
        this.error.set(error instanceof Error ? error.message : "Dataset operation failed.");
      }
      return false;
    } finally {
      if (token === this.token()) this.busy.set(false);
    }
  }

  /** @public Read authoritative server data without mutating the active dataset. */
  async refresh(): Promise<boolean> {
    return this.perform(() => this.client.samples(), result => {
      this.overview.set(result);
      this.message.set("Dataset refreshed from the backend.");
    });
  }

  /** @public Replace the backend-global dataset by scanning an audio folder. */
  async scan(request: ScanDatasetRequest): Promise<boolean> {
    if (!request.audio_dir.trim() || !request.dataset_name.trim()) {
      this.error.set("A server directory and dataset name are required.");
      return false;
    }
    return this.perform(() => this.client.scan(request), async (result, token) => {
      await this.snapshot(token);
      if (token === this.token()) this.message.set(result.message);
    });
  }

  /** @public Replace the active backend-global dataset from a server JSON file. */
  async load(path: string): Promise<boolean> {
    if (!path.trim()) { this.error.set("Enter a backend JSON path."); return false; }
    return this.perform(() => this.client.load(path.trim()), async (result, token) => {
      await this.snapshot(token);
      if (token === this.token()) this.message.set(result.message);
    });
  }

  /** @public Save the current backend dataset to its explicitly selected server path. */
  async save(request: SaveDatasetRequest): Promise<boolean> {
    if (!request.save_path.trim() || !request.dataset_name.trim()) {
      this.error.set("Enter the output JSON path and dataset name.");
      return false;
    }
    return this.perform(() => this.client.save(request), result => {
      this.message.set(result.message);
    });
  }

  /** @public Update indexed sample metadata, then reload the latest backend state. */
  async update(request: UpdateSampleRequest, expected: DatasetSample): Promise<boolean> {
    return this.perform(async () => {
      const current = await this.client.samples();
      assertSampleUnchanged(expected, current);
      return this.client.update(request);
    }, async (result, token) => {
      await this.snapshot(token);
      if (token === this.token()) this.message.set(result.message);
    });
  }

  /** @public Remove all old-server state without stopping its Python operations. */
  clear(): void {
    this.generation++;
    this.overview.set(null);
    this.busy.set(false);
    this.error.set(null);
    this.message.set(null);
  }
}


