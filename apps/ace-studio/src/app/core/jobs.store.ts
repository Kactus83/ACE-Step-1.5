/**
 * @module jobs-store
 * @remarks Non-overlapping, bounded job polling; browser refresh recovers task IDs only.
 * @public
 */
import { Injectable, OnDestroy, inject, signal } from "@angular/core";
import { BackendClient } from "./backend.client";
import { classifyBackendFailure, safeBackendMessage } from "./backend-error";
import { decodeTask } from "./api-decoder";
import { decodeAnalysisResult } from "./analysis-result";
import { AnalysisResultMode, GenerateRequest, StudioJob } from "./api.types";
import { ConnectionStore } from "./connection.store";
import { decodeSessionJobs, encodeSessionJobs } from "./job-session-codec";

/** @public Asynchronous generation orchestration without counterfeit progress. */
@Injectable({ providedIn: "root" })
export class JobsStore implements OnDestroy {
  private readonly api = inject(BackendClient);
  private readonly connection = inject(ConnectionStore);
  private readonly storageKey = "ace-studio:tasks:v2";
  private timer: ReturnType<typeof setTimeout> | undefined;
  private disposed = false;
  private pollInFlight = false;
  private failureCount = 0;
  /** @public Non-retryable backend failures suspend polling until reconnection. */
  readonly pollingBlocked = signal(false);

  /** @public All session jobs, most recent first. */
  readonly jobs = signal<readonly StudioJob[]>([]);
  /** @public True only while submitting a new task. */
  readonly submitting = signal(false);
  /** @public Last transport or submission error. */
  readonly error = signal<string | null>(null);

  constructor() { this.restore(); this.schedule(0); }

  private persist(): void {
    try {
      sessionStorage.setItem(this.storageKey,
        JSON.stringify(encodeSessionJobs(this.connection.endpoint(), this.jobs())));
    } catch { /* Session storage is optional. */ }
  }

  private restore(): void {
    try {
      const raw = sessionStorage.getItem(this.storageKey);
      if (!raw) return;
      const entries = decodeSessionJobs(JSON.parse(raw) as unknown,
        this.connection.endpoint());
      this.jobs.set(entries.map((entry): StudioJob => ({
        ...entry, phase: "unknown", progressText: "Checking recovered job…",
        results: []
      })));
    } catch { /* Corrupt or unscoped cache must never trigger backend queries. */ }
  }

  /** @public Queue generation, retaining input values only in memory. */
  async submit(request: GenerateRequest, source?: File, reference?: File,
    displayTitle?: string): Promise<void> {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.error.set(null);
    const revision = this.connection.revision();
    try {
      const accepted = await this.api.submit(request, source, reference);
      if (revision !== this.connection.revision()) return;
      const analysisMode: AnalysisResultMode | undefined = request.extract_codes_only
        ? "codes" : request.full_analysis_only ? "deep"
          : request.analysis_only ? "metadata" : undefined;
      const job: StudioJob = {
        id: accepted.task_id, title: displayTitle || request.prompt.slice(0, 72) || "New track",
        createdAt: Date.now(), phase: "queued", progressText: "Queued",
        results: [], request, analysisMode,
        hasSourceAudio: Boolean(source), hasReferenceAudio: Boolean(reference)
      };
      this.jobs.update(items => [job, ...items.filter(item => item.id !== job.id)]);
      this.persist();
      this.schedule(0);
    } catch (error: unknown) {
      if (revision === this.connection.revision()) {
        this.error.set(safeBackendMessage(error));
      }
    } finally { this.submitting.set(false); }
  }

  /**
   * @public Refresh pending tasks on demand, except when automatic polling is blocked.
   * @remarks A queue button cannot bypass non-retryable HTTP failures.
   */
  resume(): void {
    if (this.pollingBlocked()) return;
    this.failureCount = 0;
    this.schedule(0);
  }

  /**
   * @public Resume a blocked queue only after an explicit successful connect.
   * @remarks Called by the Connection screen after API validation, not by queue buttons.
   */
  resumeAfterReconnect(): void {
    this.pollingBlocked.set(false);
    this.resume();
  }

  private schedule(delayMs: number): void {
    if (this.disposed) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => { void this.poll(); }, delayMs);
  }

  private async poll(): Promise<void> {
    if (this.disposed || this.pollInFlight || this.pollingBlocked()) return;
    const active = this.jobs().filter(job =>
      job.phase === "queued" || job.phase === "running" || job.phase === "unknown");
    if (!active.length) return;
    this.pollInFlight = true;
    const revision = this.connection.revision();
    try {
      const received = await this.api.tasks(active.map(job => job.id));
      if (revision !== this.connection.revision()) return;
      const byId = new Map(received.map(result => [result.task_id, result]));
      this.jobs.update(items => items.map(job => {
        const raw = byId.get(job.id);
        if (!raw) return job;
        try {
          const next = decodeTask(raw);
          const analysis = decodeAnalysisResult(raw, job.request, job.analysisMode);
          return { ...job, phase: next.phase, results: next.results, analysis,
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
      if (revision === this.connection.revision()) {
        this.failureCount++;
        const failure = classifyBackendFailure(error);
        if (!failure.retryable) this.pollingBlocked.set(true);
        this.error.set(safeBackendMessage(error));
      }
    } finally {
      this.pollInFlight = false;
      const hasActive = this.jobs().some(job =>
        job.phase === "queued" || job.phase === "running" || job.phase === "unknown");
      if (hasActive && !this.pollingBlocked()) {
        this.schedule(Math.min(30000, 2500 * 2 ** Math.min(4, this.failureCount)));
      }
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
    this.pollingBlocked.set(false);
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







