/**
 * @module dataset-tasks-store
 * @remarks Backend-authoritative asynchronous task tracking, isolated by connection.
 * @public
 */
import { Injectable, OnDestroy, inject, signal } from "@angular/core";
import { ConnectionStore } from "../../core/connection.store";
import { DatasetClient } from "./dataset.client";
import { DatasetStore } from "./dataset.store";
import {
  AutoLabelRequest, DatasetTaskAccepted, DatasetTaskStatus, PreprocessRequest
} from "./dataset.contracts";

/** @public Bounded async polling and explicitly acknowledged high-cost operations. */
@Injectable({ providedIn: "root" })
export class DatasetTasksStore implements OnDestroy {
  private readonly client = inject(DatasetClient);
  private readonly dataset = inject(DatasetStore);
  private readonly connection = inject(ConnectionStore);
  private timer: ReturnType<typeof setTimeout> | undefined;
  private active = false;
  private reading = false;
  private generation = 0;
  readonly labelStatus = signal<DatasetTaskStatus | null>(null);
  readonly preprocessStatus = signal<DatasetTaskStatus | null>(null);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  private token(): string { return this.connection.revision() + ":" + this.generation; }

  /** @public Start observing latest server tasks without launching anything. */
  begin(): void {
    if (this.active) return;
    this.active = true;
    void this.refresh();
  }

  /** @public Stop frontend observation while server tasks keep working. */
  pause(): void {
    this.active = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
  }

  /**
   * @public Read authoritative task statuses, rejecting late stale-server responses.
   * @remarks Backend current/total counters are never converted to guessed progress.
   */
  async refresh(): Promise<void> {
    if (this.reading) return;
    const token = this.token();
    this.reading = true;
    if (this.timer) clearTimeout(this.timer);
    try {
      const [label, preprocess] = await Promise.all([
        this.client.labelStatus(), this.client.preprocessStatus()
      ]);
      if (token !== this.token()) return;
      const changed = (this.labelStatus()?.status !== "completed" && label.status === "completed")
        || (this.preprocessStatus()?.status !== "completed" && preprocess.status === "completed");
      this.labelStatus.set(label);
      this.preprocessStatus.set(preprocess);
      this.error.set(null);
      if (changed && this.dataset.overview() && !this.dataset.busy()) {
        await this.dataset.refresh();
      }
    } catch (error: unknown) {
      if (token === this.token()) {
        this.error.set(error instanceof Error ? error.message : "Dataset task status unavailable.");
      }
    } finally {
      if (token === this.token()) {
        this.reading = false;
        if (this.active) this.timer = setTimeout(() => { void this.refresh(); }, 5000);
      }
    }
  }

  private async launch(
    fn: () => Promise<DatasetTaskAccepted>, target: "label" | "preprocess"
  ): Promise<boolean> {
    if (this.busy()) return false;
    const token = this.token();
    this.busy.set(true);
    this.error.set(null);
    this.message.set(null);
    try {
      const accepted = await fn();
      if (token !== this.token()) return false;
      if (!accepted || typeof accepted.task_id !== "string" || !accepted.task_id) {
        throw new Error("Dataset backend did not return a task ID.");
      }
      this.message.set(accepted.message);
      const pending: DatasetTaskStatus = {
        task_id: accepted.task_id, status: accepted.total === 0 ? "completed" : "running",
        progress: accepted.message, current: 0, total: accepted.total
      };
      if (target === "label") this.labelStatus.set(pending);
      else this.preprocessStatus.set(pending);
      await this.refresh();
      return token === this.token();
    } catch (error: unknown) {
      if (token === this.token()) {
        this.error.set(error instanceof Error ? error.message : "Dataset task submission failed.");
      }
      return false;
    } finally {
      if (token === this.token()) this.busy.set(false);
    }
  }

  /** @public Start explicitly confirmed asynchronous auto-labeling. */
  async autoLabel(request: AutoLabelRequest): Promise<boolean> {
    if (request.chunk_size < 1 || request.batch_size < 1) {
      this.error.set("Chunk and batch sizes must be positive."); return false;
    }
    return this.launch(() => this.client.autoLabel(request), "label");
  }

  /** @public Start explicitly confirmed tensor preprocessing. */
  async preprocess(request: PreprocessRequest): Promise<boolean> {
    if (!request.output_dir.trim()) {
      this.error.set("Enter an output directory on the Python server."); return false;
    }
    return this.launch(() => this.client.preprocess(request), "preprocess");
  }

  /** @public Drop prior-server task snapshots and invalidate in-flight observations. */
  clear(): void {
    this.pause();
    this.generation++;
    this.reading = false;
    this.busy.set(false);
    this.labelStatus.set(null);
    this.preprocessStatus.set(null);
    this.error.set(null);
    this.message.set(null);
  }

  /** @public Release frontend polling resources. */
  ngOnDestroy(): void { this.pause(); }
}

