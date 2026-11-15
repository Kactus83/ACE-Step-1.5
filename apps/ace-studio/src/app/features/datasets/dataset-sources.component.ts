/**
 * @module dataset-sources-component
 * @remarks Explicit server-directory actions and guarded dataset replacement.
 * @public
 */
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { DatasetStore } from "./dataset.store";

/** @public Scan/load/save controls for one backend-global dataset. */
@Component({
  selector: "ace-dataset-sources",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./dataset-sources.component.html"
})
export class DatasetSourcesComponent {
  private readonly fb = inject(FormBuilder);
  readonly dataset = inject(DatasetStore);
  readonly confirmation = signal<string | null>(null);
  readonly scanForm = this.fb.nonNullable.group({
    audio_dir: ["", Validators.required],
    dataset_name: ["studio_dataset", Validators.required],
    custom_tag: [""],
    tag_position: ["replace"],
    all_instrumental: [true]
  });
  readonly loadForm = this.fb.nonNullable.group({
    dataset_path: ["", Validators.required]
  });
  readonly saveForm = this.fb.nonNullable.group({
    save_path: ["", Validators.required],
    dataset_name: ["studio_dataset", Validators.required]
  });

  private confirm(kind: string, data: unknown): boolean {
    const signature = JSON.stringify({ kind, data });
    if (this.confirmation() !== signature) {
      this.confirmation.set(signature);
      return false;
    }
    this.confirmation.set(null);
    return true;
  }

  /** @public Explicit scan of an audio directory already on the backend filesystem. */
  async scan(): Promise<void> {
    if (this.scanForm.invalid) { this.scanForm.markAllAsTouched(); return; }
    const raw = this.scanForm.getRawValue();
    const request = {
      ...raw, tag_position: raw.tag_position as "prepend" | "append" | "replace"
    };
    if (!this.confirm("scan", request)) return;
    await this.dataset.scan(request);
  }

  /** @public Replace the server-global dataset with one saved JSON file. */
  async load(): Promise<void> {
    if (this.loadForm.invalid) { this.loadForm.markAllAsTouched(); return; }
    const path = this.loadForm.controls.dataset_path.value.trim();
    if (!this.confirm("load", path)) return;
    const success = await this.dataset.load(path);
    if (success && this.dataset.overview()) {
      this.saveForm.controls.dataset_name.setValue(this.dataset.overview()!.dataset_name);
    }
  }

  /** @public Persist data to an explicitly confirmed server-owned path. */
  async save(): Promise<void> {
    if (this.saveForm.invalid) { this.saveForm.markAllAsTouched(); return; }
    const request = this.saveForm.getRawValue();
    if (!this.confirm("save", request)) return;
    await this.dataset.save(request);
  }

  /** @public Change a pending confirmation when the user edits any field. */
  invalidate(): void { this.confirmation.set(null); }

  /** @public Refresh server state without changing it. */
  async refresh(): Promise<void> { await this.dataset.refresh(); }
}

