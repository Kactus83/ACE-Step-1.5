/**
 * @module analysis-result-component
 * @remarks Accessible inspection and deliberate export of non-audio backend results.
 * @public
 */
import { Component, computed, input, signal } from "@angular/core";
import { AnalysisResult } from "../../core/api.types";

/** @public Metadata/code result card that never creates an audio player. */
@Component({
  selector: "ace-analysis-result",
  standalone: true,
  templateUrl: "./analysis-result.component.html"
})
export class AnalysisResultComponent {
  readonly result = input.required<AnalysisResult>();
  readonly jobId = input.required<string>();
  readonly downloaded = signal(false);
  readonly codePreview = computed(() => this.result().audioCodes?.slice(0, 2500) || "");
  readonly codeTruncated = computed(() => (this.result().audioCodes?.length || 0) > 2500);

  /** @public Export exactly the already received codes; no backend file access. */
  downloadCodes(): void {
    const codes = this.result().audioCodes;
    if (!codes) return;
    const url = URL.createObjectURL(new Blob([codes], {
      type: "text/plain;charset=utf-8"
    }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ace-audio-codes-" + this.jobId().replace(/[^a-zA-Z0-9_-]/g, "") + ".txt";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    this.downloaded.set(true);
  }
}

