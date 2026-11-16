/**
 * @module analysis-component
 * @remarks Audited audio-code and metadata inspection via the existing ACE-Step queue.
 * @public
 */
import { Component, computed, inject, output, signal } from "@angular/core";
import { BackendStore } from "../../core/backend.store";
import { JobsStore } from "../../core/jobs.store";
import { AnalysisMode, mapAnalysisRequest } from "./analysis.request";
import { validateAudioUpload } from "../create/source-audio";

/** @public Standalone analysis workspace with explicit server jobs and no audio synthesis. */
@Component({
  selector: "ace-analysis",
  standalone: true,
  templateUrl: "./analysis.component.html"
})
export class AnalysisComponent {
  readonly backend = inject(BackendStore);
  readonly jobs = inject(JobsStore);
  readonly showJobs = output<void>();
  readonly mode = signal<AnalysisMode>("codes");
  readonly model = signal("");
  readonly prompt = signal("");
  readonly lyrics = signal("");
  readonly source = signal<File | null>(null);
  readonly error = signal<string | null>(null);
  readonly needsMedia = computed(() => this.mode() !== "metadata");
  readonly needsLm = computed(() => this.mode() !== "codes");
  readonly canSubmit = computed(() => this.backend.health()?.status === "ok"
    && !this.jobs.submitting() && (!this.needsMedia() || !!this.source())
    && (!this.needsLm() || !!this.backend.inventory()?.llm_initialized)
    && (this.mode() !== "metadata" || !!this.prompt().trim()));

  /** @public Switch a user-selected analysis mode; discard unnecessary source bytes. */
  chooseMode(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    if (!["codes", "deep", "metadata"].includes(target.value)) return;
    this.mode.set(target.value as AnalysisMode);
    if (target.value === "metadata") this.source.set(null);
    this.error.set(null);
  }

  /** @public Capture a selected server-advertised DiT model without initialization. */
  chooseModel(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) this.model.set(target.value);
  }

  /** @public Update the analysis description or optional lyric hint. */
  setText(event: Event, field: "prompt" | "lyrics"): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (field === "prompt") this.prompt.set(target.value);
    else this.lyrics.set(target.value);
  }

  /** @public Choose a transient source audio file, never persisted to browser storage. */
  chooseFile(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const file = target.files?.item(0) || null;
    const issue = file ? validateAudioUpload(file) : null;
    if (issue) {
      target.value = "";
      this.source.set(null);
      this.error.set(issue);
      return;
    }
    this.source.set(file);
    this.error.set(null);
  }

  /**
   * @public Submit one analysis task to ACE-Step; never auto-run on navigation.
   * @remarks Metadata/deep analysis requires the initialized 5Hz LM.
   */
  async submit(): Promise<void> {
    this.error.set(null);
    if (this.backend.health()?.status !== "ok") {
      this.error.set("Connect to the standalone ACE-Step API before analysis.");
      return;
    }
    try {
      const request = mapAnalysisRequest({
        mode: this.mode(), model: this.model(),
        prompt: this.prompt(), lyrics: this.lyrics()
      }, !!this.source(), !!this.backend.inventory()?.llm_initialized);
      const titles: Record<AnalysisMode, string> = {
        codes: "Audio codes",
        deep: "Deep audio analysis",
        metadata: "Music metadata analysis"
      };
      const suffix = this.mode() === "metadata"
        ? this.prompt().trim().slice(0, 64) : this.source()?.name || "";
      await this.jobs.submit(request, this.needsMedia() ? this.source() || undefined : undefined,
        undefined, titles[this.mode()] + (suffix ? " · " + suffix : ""));
      if (this.jobs.error()) {
        this.error.set(this.jobs.error());
        return;
      }
      this.showJobs.emit();
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Analysis submission failed.");
    }
  }
}
