/**
 * @module dataset-samples-component
 * @remarks Searchable indexed sample editor; server owns audio bytes and identity.
 * @public
 */
import { Component, computed, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { DatasetStore } from "./dataset.store";
import { DatasetSample } from "./dataset.contracts";
import { updateSampleDto } from "./dataset.decoder";

/** @public Select, inspect and explicitly update sample metadata. */
@Component({
  selector: "ace-dataset-samples",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./dataset-samples.component.html"
})
export class DatasetSamplesComponent {
  private readonly fb = inject(FormBuilder);
  readonly dataset = inject(DatasetStore);
  readonly selectedIndex = signal<number | null>(null);
  readonly baseline = signal<DatasetSample | null>(null);
  readonly search = signal("");
  readonly selected = computed(() => {
    const index = this.selectedIndex();
    return index === null ? null
      : this.dataset.overview()?.samples.find(sample => sample.index === index) || null;
  });
  readonly visible = computed(() => {
    const query = this.search().trim().toLowerCase();
    const matches = (this.dataset.overview()?.samples || []).filter(item =>
      !query || item.filename.toLowerCase().includes(query)
      || item.genre.toLowerCase().includes(query)
      || item.caption.toLowerCase().includes(query));
    return matches.slice(0, 100);
  });

  readonly form = this.fb.nonNullable.group({
    caption: [""], genre: [""], prompt_override: [""], lyrics: [""],
    bpm: [0, [Validators.min(0), Validators.max(400)]],
    keyscale: [""], timesignature: [""], language: ["unknown"],
    is_instrumental: [true]
  });

  /** @public Filter client-side metadata without sending user search text to the API. */
  searchChanged(event: Event): void {
    const el = event.target;
    if (el instanceof HTMLInputElement) this.search.set(el.value);
  }

  /** @public Show a single server-indexed sample in the editor. */
  choose(sample: DatasetSample): void {
    this.selectedIndex.set(sample.index);
    this.baseline.set({ ...sample });
    this.form.reset({
      caption: sample.caption,
      genre: sample.genre,
      prompt_override: sample.prompt_override || "",
      lyrics: sample.lyrics,
      bpm: sample.bpm ?? 0,
      keyscale: sample.keyscale,
      timesignature: sample.timesignature,
      language: sample.language || "unknown",
      is_instrumental: sample.is_instrumental
    });
  }

  /**
   * @public Write only metadata for the selected sample.
   * @remarks No client audio path or sample filename is accepted as an update field.
   */
  async save(): Promise<void> {
    const sample = this.selected();
    const original = this.baseline();
    if (!sample || !original || sample.index !== original.index || this.form.invalid) {
      this.form.markAllAsTouched(); return;
    }
    const raw = this.form.getRawValue();
    const request = updateSampleDto(sample, {
      caption: raw.caption,
      genre: raw.genre,
      prompt_override: raw.prompt_override || null,
      lyrics: raw.lyrics,
      bpm: raw.bpm > 0 ? raw.bpm : null,
      keyscale: raw.keyscale,
      timesignature: raw.timesignature,
      language: raw.language,
      is_instrumental: raw.is_instrumental
    });
    const updated = await this.dataset.update(request, original);
    if (updated) {
      const latest = this.selected();
      if (latest) this.choose(latest);
    }
  }
}


