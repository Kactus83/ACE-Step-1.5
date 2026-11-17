/**
 * @module jobs-component
 * @remarks Job list, actual backend progress text, and result-to-editor actions.
 * @public
 */
import { Component, computed, inject, output, signal } from "@angular/core";
import { formatStudioDate } from "../../core/localized-date";
import { JobsStore } from "../../core/jobs.store";
import { LocaleKey, LocaleStore } from "../../core/locale.store";
import { GeneratedAudio, JobPhase, StudioJob } from "../../core/api.types";
import { WorkflowStore } from "../../core/workflow.store";
import { AudioCardComponent } from "./audio-card.component";
import { withResultSeed } from "../create/restore-request";
import { JobFilter, JobSort, availableJobModels, filterJobs } from "./job-filter";
import { BatchNavigatorComponent } from "./batch-navigator.component";
import { VariantSelection, groupJobsByDay, normalizeVariantSelection } from "./batch-navigation";
import { LibrarySaveComponent } from "../library/library-save.component";
import { ComparisonComponent } from "./comparison.component";
import { AnalysisResultComponent } from "./analysis-result.component";

/** @public Accessible generation queue and track results. */
@Component({
  selector: "ace-jobs",
  standalone: true,
  imports: [AudioCardComponent, AnalysisResultComponent, LibrarySaveComponent, ComparisonComponent, BatchNavigatorComponent],
  templateUrl: "./jobs.component.html"
})
export class JobsComponent {
  readonly jobs = inject(JobsStore);
  readonly locale = inject(LocaleStore);
  readonly filter = signal<JobFilter>("all");
  readonly search = signal("");
  readonly model = signal("");
  readonly order = signal<JobSort>("newest");
  readonly models = computed(() => availableJobModels(this.jobs.jobs()));
  readonly activeModel = computed(() =>
    this.models().includes(this.model()) ? this.model() : ""
  );
  readonly visible = computed(() =>
    filterJobs(this.jobs.jobs(), this.filter(), this.search(),
      this.activeModel(), this.order())
  );
  readonly selections = signal<Readonly<Record<string, VariantSelection>>>({});
  readonly groups = computed(() => groupJobsByDay(this.visible()));
  private readonly workflow = inject(WorkflowStore);
  /** @public Request navigation to create editor. */
  readonly reuse = output<void>();

  /** @public Focus an individual playable result without changing the backend job. */
  chooseVariant(id: string, variant: VariantSelection): void {
    this.selections.update(previous => ({ ...previous, [id]: variant }));
  }

  /** @public Retain all items or one playable item when server results change. */
  showVariant(job: StudioJob, index: number): boolean {
    const selection = normalizeVariantSelection(
      this.selections()[job.id] ?? "all", job.results);
    return selection === "all" || selection === index;
  }

  /** @public Localize backend task phase without rewriting server progress diagnostics. */
  phaseLabel(phase: JobPhase): string {
    const key: Record<JobPhase, LocaleKey> = {
      queued: "jobs.phase.queued",
      running: "jobs.phase.running",
      succeeded: "jobs.phase.succeeded",
      failed: "jobs.phase.failed",
      unknown: "jobs.phase.unknown"
    };
    return this.locale.text(key[phase]);
  }

  /** @public Localize the client event timestamp in the device's timezone. */
  dateLabel(value: number): string {
    return formatStudioDate(value, this.locale.mode());
  }

  /** @public Change the client-only phase filter without contacting the backend. */
  filterChanged(event: Event): void {
    const el = event.target;
    if (!(el instanceof HTMLSelectElement)) return;
    if (["all", "active", "succeeded", "failed"].includes(el.value)) {
      this.filter.set(el.value as JobFilter);
    }
  }

  /** @public Show only explicitly recorded model choices, or all jobs. */
  modelChanged(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) this.model.set(target.value);
  }

  /** @public Change chronological order without rewriting the stored task list. */
  orderChanged(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement
      && (target.value === "newest" || target.value === "oldest")) {
      this.order.set(target.value);
    }
  }

  /** @public Search task IDs, titles and returned descriptions locally. */
  searchChanged(event: Event): void {
    const el = event.target;
    if (el instanceof HTMLInputElement) this.search.set(el.value);
  }

  /**
   * @public Report actual server-supplied progress as an integer percent.
   * @returns Null unless the backend supplied a finite normalized value.
   */
  reportedProgress(job: StudioJob): number | null {
    const progress = job.results.find(result => typeof result.progress === "number")?.progress;
    return progress === undefined ? null : Math.round(progress * 100);
  }

  /** @public Distinguish successful analysis-only jobs from playable audio results. */
  hasPlayableAudio(job: StudioJob): boolean {
    return job.results.some(result => Boolean(result.file));
  }

  /** @public Stage the submitted settings plus reported variant seed without GPU work. */
  restore(job: StudioJob, audio: GeneratedAudio): void {
    if (!job.request) return;
    this.workflow.useSettings(withResultSeed(job.request, audio.seed_value),
      job.title, Boolean(job.hasSourceAudio || job.hasReferenceAudio));
    this.reuse.emit();
  }

  /** @public Transfer extracted semantic codes to Create without persisting or auto-running. */
  useCodes(codes: string): void {
    this.workflow.useCodes(codes);
    this.reuse.emit();
  }

  /** @public Stage actual LM analysis metadata as a user-editable generation draft. */
  useDescription(value: { prompt: string; lyrics: string }): void {
    this.workflow.useSettings({
      task_type: "text2music",
      prompt: value.prompt,
      lyrics: value.lyrics,
      thinking: false,
      use_random_seed: true
    }, "Analysis-derived composition", false);
    this.reuse.emit();
  }

  /** @public Move a real generated audio artifact into a new edit intent. */
  edit(audio: GeneratedAudio, mode: "cover" | "repaint"): void {
    this.workflow.useAudio(audio, mode);
    this.reuse.emit();
  }
}


