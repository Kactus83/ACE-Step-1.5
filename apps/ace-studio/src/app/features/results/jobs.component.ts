/**
 * @module jobs-component
 * @remarks Job list, actual backend progress text, and result-to-editor actions.
 * @public
 */
import { Component, computed, inject, output, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { JobsStore } from "../../core/jobs.store";
import { GeneratedAudio, StudioJob } from "../../core/api.types";
import { WorkflowStore } from "../../core/workflow.store";
import { AudioCardComponent } from "./audio-card.component";
import { withResultSeed } from "../create/restore-request";
import { JobFilter, filterJobs } from "./job-filter";
import { LibrarySaveComponent } from "../library/library-save.component";
import { ComparisonComponent } from "./comparison.component";
import { AnalysisResultComponent } from "./analysis-result.component";

/** @public Accessible generation queue and track results. */
@Component({
  selector: "ace-jobs",
  standalone: true,
  imports: [AudioCardComponent, AnalysisResultComponent, LibrarySaveComponent, ComparisonComponent, DatePipe],
  templateUrl: "./jobs.component.html"
})
export class JobsComponent {
  readonly jobs = inject(JobsStore);
  readonly filter = signal<JobFilter>("all");
  readonly search = signal("");
  readonly visible = computed(() =>
    filterJobs(this.jobs.jobs(), this.filter(), this.search())
  );
  private readonly workflow = inject(WorkflowStore);
  /** @public Request navigation to create editor. */
  readonly reuse = output<void>();

  /** @public Change the client-only phase filter without contacting the backend. */
  filterChanged(event: Event): void {
    const el = event.target;
    if (!(el instanceof HTMLSelectElement)) return;
    if (["all", "active", "succeeded", "failed"].includes(el.value)) {
      this.filter.set(el.value as JobFilter);
    }
  }

  /** @public Search task IDs, titles and returned descriptions locally. */
  searchChanged(event: Event): void {
    const el = event.target;
    if (el instanceof HTMLInputElement) this.search.set(el.value);
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

  /** @public Move a real generated audio artifact into a new edit intent. */
  edit(audio: GeneratedAudio, mode: "cover" | "repaint"): void {
    this.workflow.useAudio(audio, mode);
    this.reuse.emit();
  }
}






