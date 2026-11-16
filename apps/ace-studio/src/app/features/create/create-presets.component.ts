/**
 * @module create-presets-component
 * @remarks Reusable local, whitelist-sanitized generation preset controls.
 * @public
 */
import { Component, inject, input, output, signal } from "@angular/core";
import { createGenerationForm } from "./create.form";
import { PresetsStore } from "../../core/presets.store";

/** @public Preset workspace free of backend and audio-storage responsibilities. */
@Component({
  selector: "ace-create-presets",
  standalone: true,
  templateUrl: "./create-presets.component.html"
})
export class CreatePresetsComponent {
  readonly form = input.required<ReturnType<typeof createGenerationForm>>();
  readonly resetMedia = output<void>();
  readonly presets = inject(PresetsStore);
  readonly presetName = signal("");
  readonly selectedPresetId = signal("");
  readonly deletingPreset = signal(false);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);

  /** @public Capture a human-readable local preset name. */
  changePresetName(event: Event): void {
    const node = event.target;
    if (node instanceof HTMLInputElement) this.presetName.set(node.value);
  }

  /** @public Select an already validated saved preset. */
  selectPreset(event: Event): void {
    const node = event.target;
    if (node instanceof HTMLSelectElement) {
      this.selectedPresetId.set(node.value);
      this.deletingPreset.set(false);
    }
  }

  /** @public Save a versioned, credential-free form snapshot locally. */
  savePreset(): void {
    this.error.set(null);
    this.notice.set(null);
    try {
      const saved = this.presets.save(this.presetName(), this.form().getRawValue());
      this.selectedPresetId.set(saved.id);
      this.presetName.set("");
      this.notice.set("Preset saved on this device.");
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : "Unable to save preset.");
    }
  }

  /** @public Restore saved settings, dropping transient source audio from prior mode. */
  restorePreset(): void {
    const preset = this.presets.get(this.selectedPresetId());
    if (!preset) return;
    this.form().patchValue({
      ...preset.fields as unknown as
        Parameters<ReturnType<typeof createGenerationForm>["patchValue"]>[0],
      audio_code_string: ""
    });
    this.resetMedia.emit();
    this.error.set(null);
    this.notice.set("Preset restored. Source media and semantic audio codes were cleared.");
  }

  /** @public Require two explicit clicks before removing local preset data. */
  deletePreset(): void {
    const id = this.selectedPresetId();
    if (!id) return;
    if (!this.deletingPreset()) { this.deletingPreset.set(true); return; }
    this.presets.remove(id);
    this.selectedPresetId.set("");
    this.deletingPreset.set(false);
    this.notice.set("Preset deleted from this device.");
  }
}


