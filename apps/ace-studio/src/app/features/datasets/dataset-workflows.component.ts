/**
 * @module dataset-workflows-component
 * @remarks Explicit LLM labeling and asynchronous tensor preparation workflows.
 * @public
 */
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { BackendStore } from "../../core/backend.store";
import { DatasetStore } from "./dataset.store";
import { DatasetTasksStore } from "./dataset.tasks.store";
import { AutoLabelRequest, PreprocessRequest } from "./dataset.contracts";

/** @public Review and submit asynchronous dataset operations with confirmations. */
@Component({
  selector: "ace-dataset-workflows",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./dataset-workflows.component.html"
})
export class DatasetWorkflowsComponent {
  private readonly fb = inject(FormBuilder);
  readonly backend = inject(BackendStore);
  readonly dataset = inject(DatasetStore);
  readonly tasks = inject(DatasetTasksStore);
  readonly confirmLabel = signal<string | null>(null);
  readonly confirmPreprocess = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly labeling = this.fb.nonNullable.group({
    only_unlabeled: [true],
    skip_metas: [false],
    format_lyrics: [false],
    transcribe_lyrics: [false],
    chunk_size: [16, [Validators.min(1), Validators.max(1000)]],
    batch_size: [1, [Validators.min(1), Validators.max(32)]],
    save_path: [""]
  });
  readonly preprocessing = this.fb.nonNullable.group({
    output_dir: ["", Validators.required],
    skip_existing: [true]
  });

  /** @public Clear a confirmation when the corresponding request fields change. */
  changed(kind: "label" | "preprocess"): void {
    if (kind === "label") this.confirmLabel.set(null);
    else this.confirmPreprocess.set(null);
  }

  /**
   * @public Begin server-side async LLM labeling, with two matching submissions.
   * @remarks This operation consumes GPU/LM resources and may persist server files.
   */
  async startLabeling(): Promise<void> {
    this.error.set(null);
    if (this.labeling.invalid) { this.labeling.markAllAsTouched(); return; }
    if (!this.dataset.overview()) {
      this.error.set("Load or scan a dataset before labeling."); return;
    }
    if (!this.backend.inventory()?.llm_initialized) {
      this.error.set("Initialize a backend LM before automatic labeling."); return;
    }
    if (this.tasks.labelStatus()?.status === "running" || this.tasks.busy()) return;
    const raw = this.labeling.getRawValue();
    const request: AutoLabelRequest = {
      ...raw, save_path: raw.save_path.trim() || undefined
    };
    const signature = JSON.stringify(request);
    if (signature !== this.confirmLabel()) { this.confirmLabel.set(signature); return; }
    this.confirmLabel.set(null);
    await this.tasks.autoLabel(request);
  }

  /**
   * @public Begin tensor preprocessing, gated by labeled sample availability.
   * @remarks Output is written only by the Python backend to its own filesystem.
   */
  async startPreprocessing(): Promise<void> {
    this.error.set(null);
    if (this.preprocessing.invalid) { this.preprocessing.markAllAsTouched(); return; }
    if (!this.dataset.overview()?.labeled_count) {
      this.error.set("At least one labeled dataset sample is required."); return;
    }
    if (this.tasks.preprocessStatus()?.status === "running" || this.tasks.busy()) return;
    const request: PreprocessRequest = {
      output_dir: this.preprocessing.controls.output_dir.value.trim(),
      skip_existing: this.preprocessing.controls.skip_existing.value
    };
    if (!request.output_dir) { this.error.set("Enter a backend tensor output directory."); return; }
    const signature = JSON.stringify(request);
    if (signature !== this.confirmPreprocess()) {
      this.confirmPreprocess.set(signature); return;
    }
    this.confirmPreprocess.set(null);
    await this.tasks.preprocess(request);
  }

  /** @public Refresh only the server-reported statuses of both operations. */
  async refresh(): Promise<void> { await this.tasks.refresh(); }
}

