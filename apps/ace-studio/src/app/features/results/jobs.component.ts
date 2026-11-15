/**
 * @module jobs-component
 * @remarks Job list, actual backend progress text, and result-to-editor actions.
 * @public
 */
import { Component, inject, output } from "@angular/core";
import { DatePipe } from "@angular/common";
import { JobsStore } from "../../core/jobs.store";
import { GeneratedAudio, StudioJob } from "../../core/api.types";
import { WorkflowStore } from "../../core/workflow.store";
import { AudioCardComponent } from "./audio-card.component";
import { withResultSeed } from "../create/restore-request";
import { LibrarySaveComponent } from "../library/library-save.component";
import { ComparisonComponent } from "./comparison.component";

/** @public Accessible generation queue and track results. */
@Component({
  selector: "ace-jobs",
  standalone: true,
  imports: [AudioCardComponent, LibrarySaveComponent, ComparisonComponent, DatePipe],
  templateUrl: "./jobs.component.html"
})
export class JobsComponent {
  readonly jobs = inject(JobsStore);
  private readonly workflow = inject(WorkflowStore);
  /** @public Request navigation to create editor. */
  readonly reuse = output<void>();

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

  /** @public Move a real generated audio artifact into a new edit intent. */
  edit(audio: GeneratedAudio, mode: "cover" | "repaint"): void {
    this.workflow.useAudio(audio, mode);
    this.reuse.emit();
  }
}



