/**
 * @module jobs-store
 * @remarks Non-overlapping, bounded job polling; browser refresh recovers task IDs only.
 * @public
 */
import { Injectable, OnDestroy, inject, signal } from "@angular/core";
import { BackendClient } from "./backend.client";
import { decodeTask } from "./api-decoder";
import { GenerateRequest, StudioJob } from "./api.types";

/** @public Asynchronous generation orchestration without counterfeit progress. */
@Injectable({ providedIn: "root" })
export class JobsStore implements OnDestroy {
  private readonly api = inject(BackendClient);
  private readonly storageKey = "ace-studio:tasks:v1";
  private timer: ReturnType<typeof setTimeout> | undefined;
  private disposed = false;
  private pollInFlight = false;
  private failureCount = 0;

  /** @public All session jobs, most recent first. */
  readonly jobs = signal<readonly StudioJob[]>([]);
  /** @public True only while submitting a new task. */
  readonly submitting = signal(false);
  /** @public Last transport or submission error. */
  readonly error = signal<string | null>(null);

  constructor() { this.restore(); this.schedule(0); }

  private persist(): void {
    try {
      const minimal = this.jobs().slice(0, 30).map(job => ({
        id: job.id, title: job.title, createdAt: job.createdAt
      }));
      sessionStorage.setItem(this.storageKey, JSON.stringify(minimal));
    } catch { /* storage may be blocked */ }
  }

  private restore(): void {
    try {
      const raw: unknown = JSON.parse(sessionStorage.getItem(this.storageKey) || "[]");
      if (!Array.isArray(raw)) return;
      const jobs: StudioJob[] = raw.slice(0, 30).filter(
        entry => entry && typeof entry.id === "string" && typeof entry.title === "string"
      ).map(entry => ({
        id: String(entry.id), title: String(entry.title),
        createdAt: Number(entry.createdAt) || Date.now(),
        phase: "unknown", progressText: "Checking recovered job…", results: []
      }));
      this.jobs.set(jobs);
    } catch { /* a corrupted session cache is not authoritative */ }
  }

  /** @public Queue generation, retaining input values only in memory. */
  async submit(request: GenerateRequest, source?: File, reference?: File): Promise<void> {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.error.set(null);
    try {
      const accepted = await this.api.submit(request, source, reference);
      const job: StudioJob = {
        id: accepted.task_id, title: request.track_name || request.prompt.slice(0, 72) || "New track",
        createdAt: Date.now(), phase: "queued", progressText: "Queued",
        results: [], request
      };
      this.jobs.update(items => [job, ...items.filter(item => item.id !== job.id)]);
      this.persist();
      this.schedule(0);
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Generation submission failed.");
    } finally { this.submitting.set(false); }
  }

  /** @public Resume polling immediately after reconnection. */
  resume(): void { this.failureCount = 0; this.schedule(0); }

  private schedule(delayMs: number): void {
    if (this.disposed) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => { void this.poll(); }, delayMs);
  }

  private async poll(): Promise<void> {
    if (this.disposed || this.pollInFlight) return;
    const active = this.jobs().filter(job =>
      job.phase === "queued" || job.phase === "running" || job.phase === "unknown");
    if (!active.length) return;
    this.pollInFlight = true;
    try {
      const received = await this.api.tasks(active.map(job => job.id));
      const byId = new Map(received.map(result => [result.task_id, result]));
      this.jobs.update(items => items.map(job => {
        const raw = byId.get(job.id);
        if (!raw) return job;
        try {
          const next = decodeTask(raw);
          return { ...job, phase: next.phase, results: next.results,
            progressText: next.progressText || job.progressText,
            error: next.results.find(result => result.error)?.error || undefined };
        } catch (error: unknown) {
          return { ...job, phase: "unknown",
            progressText: error instanceof Error ? error.message : "Malformed result" };
        }
      }));
      this.failureCount = 0;
      this.error.set(null);
    } catch (error: unknown) {
      this.failureCount++;
      this.error.set(error instanceof Error ? error.message : "Job polling unavailable.");
    } finally {
      this.pollInFlight = false;
      const hasActive = this.jobs().some(job =>
        job.phase === "queued" || job.phase === "running" || job.phase === "unknown");
      if (hasActive) this.schedule(Math.min(30000, 2500 * 2 ** Math.min(4, this.failureCount)));
    }
  }

  /**
   * @public Reset local task history when switching to a different backend.
   * @remarks Does not cancel any running computation on the prior server.
   */
  resetSession(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
    this.jobs.set([]);
    this.error.set(null);
    this.failureCount = 0;
    this.persist();
  }

  /** @public Forget a local item; does not cancel the backend GPU computation. */
  forget(id: string): void {
    this.jobs.update(items => items.filter(job => job.id !== id));
    this.persist();
  }

  /** @public Release timers when Angular destroys the store. */
  ngOnDestroy(): void {
    this.disposed = true;
    if (this.timer) clearTimeout(this.timer);
  }
}
