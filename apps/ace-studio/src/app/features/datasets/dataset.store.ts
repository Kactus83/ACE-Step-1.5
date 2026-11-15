/**
 * @module dataset-store
 * @remarks One currently active dataset per backend process; no local dataset imitation.
 * @public
 */
import { Injectable, inject, signal } from "@angular/core";
import { DatasetClient } from "./dataset.client";
import { DatasetOverview, SaveDatasetRequest, ScanDatasetRequest, UpdateSampleRequest } from "./dataset.contracts";

/** @public Current dataset and explicit server mutations, with serialized writes. */
@Injectable({ providedIn: "root" })
export class DatasetStore {
  private readonly client = inject(DatasetClient);
  readonly overview = signal<DatasetOverview | null>(null);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  private async perform<T>(task: () => Promise<T>, onSuccess: (result: T) => Promise<void> | void
  ): Promise<boolean> {
    if (this.busy()) return false;
    this.busy.set(true);
    this.error.set(null);
    this.message.set(null);
    try {
      const result = await task();
      await onSuccess(result);
      return true;
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Dataset operation failed.");
      return false;
    } finally {
      this.busy.set(false);
    }
  }

  /** @public Fetch the active dataset on the connected API, if one exists. */
  async refresh(): Promise<boolean> {
    return this.perform(() => this.client.samples(), result => {
      this.overview.set(result);
      this.message.set("Dataset refreshed from the backend.");
    });
  }

  /** @public Replace current backend dataset by scanning a server directory. */
  async scan(request: ScanDatasetRequest): Promise<boolean> {
    if (!request.audio_dir.trim() || !request.dataset_name.trim()) {
      this.error.set("A server directory and dataset name are required.");
      return false;
    }
    return this.perform(() => this.client.scan(request), async result => {
      this.overview.set(await this.client.samples());
      this.message.set(result.message);
    });
  }

  /** @public Replace active dataset by loading an existing JSON file on the server. */
  async load(path: string): Promise<boolean> {
    if (!path.trim()) { this.error.set("Enter a backend JSON path."); return false; }
    return this.perform(() => this.client.load(path.trim()), async result => {
      this.overview.set(await this.client.samples());
      this.message.set(result.message);
    });
  }

  /** @public Save the current backend dataset to a chosen server-local path. */
  async save(request: SaveDatasetRequest): Promise<boolean> {
    if (!request.save_path.trim() || !request.dataset_name.trim()) {
      this.error.set("Enter the output JSON path and dataset name.");
      return false;
    }
    return this.perform(() => this.client.save(request), result => {
      this.message.set(result.message);
    });
  }

  /** @public Update metadata of one sample, then refresh authoritative dataset state. */
  async update(request: UpdateSampleRequest): Promise<boolean> {
    return this.perform(() => this.client.update(request), async result => {
      this.overview.set(await this.client.samples());
      this.message.set(result.message);
    });
  }

  /** @public Clear data when switching API servers; never cancel backend work. */
  clear(): void {
    this.overview.set(null);
    this.error.set(null);
    this.message.set(null);
  }
}

