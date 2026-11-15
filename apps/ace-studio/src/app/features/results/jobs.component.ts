/**
 * @module jobs-component
 * @remarks Job list, actual backend progress text, and result-to-editor actions.
 * @public
 */
import { Component, inject, output } from "@angular/core";
import { JobsStore } from "../../core/jobs.store";
import { GeneratedAudio } from "../../core/api.types";
import { WorkflowStore } from "../../core/workflow.store";
import { AudioCardComponent } from "./audio-card.component";

/** @public Accessible generation queue and track results. */
@Component({
  selector: "ace-jobs",
  standalone: true,
  imports: [AudioCardComponent],
  templateUrl: "./jobs.component.html"
})
export class JobsComponent {
  readonly jobs = inject(JobsStore);
  private readonly workflow = inject(WorkflowStore);
  /** @public Request navigation to create editor. */
  readonly reuse = output<void>();

  /** @public Move a real generated audio artifact into a new edit intent. */
  edit(audio: GeneratedAudio, mode: "cover" | "repaint"): void {
    this.workflow.useAudio(audio, mode);
    this.reuse.emit();
  }
}
