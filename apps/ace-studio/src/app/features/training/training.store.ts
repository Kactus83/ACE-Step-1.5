/**
 * @module training-store
 * @remarks Read-only periodic status and explicit high-impact operations.
 * @public
 */
import { Injectable, OnDestroy, inject, signal } from "@angular/core";
import { TrainingClient } from "./training.client";
import {
  DatasetScanResult, StartLoKrRequest, StartLoRARequest,
  TensorDirectoryInfo, TrainingStatus
} from "./training.types";

/** @public Training orchestration with a single active poll and bounded rate. */
@Injectable({ providedIn: "root" })
export class TrainingStore implements OnDestroy {
  private readonly client = inject(TrainingClient);
  private timer: ReturnType<typeof setTimeout> | undefined;
  private active = false;
  private generation = 0;
  readonly status = signal<TrainingStatus | null>(null);
  readonly tensorInfo = signal<TensorDirectoryInfo | null>(null);
  readonly dataset = signal<DatasetScanResult | null>(null);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  /** @public Begin periodic observation only while the training view is displayed. */
  begin(): void {
    this.active = true;
    void this.refresh();
  }

  /** @public Suspend background UI polling when the view closes. */
  pause(): void {
    this.active = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
  }

  /** @public Inspect live status without initiating a job. */
  async refresh(): Promise<void> {
    if (this.busy()) return;
    const generation = this.generation;
    if (this.timer) clearTimeout(this.timer);
    this.busy.set(true);
    try {
      const status = await this.client.status();
      if (generation !== this.generation) return;
      this.status.set(status);
      this.error.set(null);
    } catch (error: unknown) {
      if (generation === this.generation) {
        this.error.set(error instanceof Error ? error.message : "Training status unavailable.");
      }
    } finally {
      if (generation === this.generation) this.busy.set(false);
      if (this.active && generation === this.generation) this.timer = setTimeout(() => { void this.refresh(); }, 5000);
    }
  }

  /** @public Validate tensor manifest before submitting an expensive run. */
  async validateTensors(directory: string): Promise<void> {
    this.tensorInfo.set(null);
    this.error.set(null);
    try { this.tensorInfo.set(await this.client.tensors(directory.trim())); }
    catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Tensor validation failed.");
    }
  }

  /** @public Scan server-hosted source audio without uploading local browser files. */
  async scanDataset(dir: string, name: string, instrumental: boolean): Promise<void> {
    this.error.set(null);
    try { this.dataset.set(await this.client.scan(dir.trim(), name.trim(), instrumental)); }
    catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Dataset scan failed.");
    }
  }

  /**
   * @public Start one confirmed train run from a validated server directory.
   * @throws Error when tensors were not validated for this exact path.
   */
  async start(mode: "lora" | "lokr", payload: StartLoRARequest | StartLoKrRequest): Promise<void> {
    if (!this.tensorInfo() || this.tensorInfo()?.tensor_dir !== payload.tensor_dir) {
      throw new Error("Validate the exact tensor directory before starting training.");
    }
    this.error.set(null);
    try {
      const accepted = mode === "lora"
        ? await this.client.startLoRA(payload as StartLoRARequest)
        : await this.client.startLoKr(payload as StartLoKrRequest);
      this.message.set(accepted.message);
      await this.refresh();
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Unable to start training.");
    }
  }

  /** @public Ask the backend to stop a run gracefully, not terminate a process. */
  async requestStop(): Promise<void> {
    this.error.set(null);
    try {
      const result = await this.client.requestStop();
      this.message.set(result.message);
      await this.refresh();
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Stop request failed.");
    }
  }

  /** @public Erase prior server status and validations on connection changes. */
  clear(): void {
    this.pause();
    this.generation++;
    this.status.set(null);
    this.tensorInfo.set(null);
    this.dataset.set(null);
    this.error.set(null);
    this.message.set(null);
    this.busy.set(false);
  }

  /** @public Release observation timers. */
  ngOnDestroy(): void { this.pause(); }
}

