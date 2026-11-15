/**
 * @module training-export-component
 * @remarks Deliberately guarded trained-adapter export using the existing Python API.
 * @public
 */
import { Component, inject, input, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ConnectionStore } from "../../core/connection.store";
import { TrainingClient } from "./training.client";
import { validateTrainingExport } from "./training-export.request";

/**
 * @public Adapter export dialog with two-step confirmation and typed overwrite acknowledgement.
 * @remarks The upstream endpoint deletes a pre-existing destination directory.
 */
@Component({
  selector: "ace-training-export",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./training-export.component.html"
})
export class TrainingExportComponent {
  private readonly fb = inject(FormBuilder);
  private readonly client = inject(TrainingClient);
  private readonly connection = inject(ConnectionStore);
  readonly currentOutput = input("");
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly confirmation = signal<string | null>(null);
  readonly form = this.fb.nonNullable.group({
    lora_output_dir: ["", Validators.required],
    export_path: ["", Validators.required],
    acknowledgement: ["", Validators.required]
  });

  /** @public Prefill the output used by the latest selected training configuration. */
  useCurrentOutput(): void {
    this.form.controls.lora_output_dir.setValue(this.currentOutput());
    this.confirmation.set(null);
  }

  /** @public Reset confirmation after changing source or destination. */
  invalidate(): void { this.confirmation.set(null); }

  /**
   * @public Export a trained adapter after typed and repeated destructive confirmation.
   * @remarks No filesystem existence probe is available, so assume overwrite is possible.
   */
  async export(): Promise<void> {
    this.error.set(null);
    this.message.set(null);
    if (this.busy() || this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.form.controls.acknowledgement.value.trim() !== "OVERWRITE") {
      this.error.set("Type OVERWRITE exactly to acknowledge possible destination deletion.");
      return;
    }
    let request;
    try {
      request = validateTrainingExport(this.form.controls.lora_output_dir.value,
        this.form.controls.export_path.value);
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Unsafe export paths.");
      return;
    }
    const revision = this.connection.revision();
    const key = JSON.stringify({ revision, request });
    if (this.confirmation() !== key) {
      this.confirmation.set(key);
      return;
    }
    this.confirmation.set(null);
    this.busy.set(true);
    try {
      const result = await this.client.exportAdapter(request);
      if (revision === this.connection.revision()) {
        this.message.set(result.message || "Adapter export completed on the backend.");
      }
    } catch (error: unknown) {
      if (revision === this.connection.revision()) {
        this.error.set(error instanceof Error ? error.message : "Adapter export failed.");
      }
    } finally { this.busy.set(false); }
  }
}

