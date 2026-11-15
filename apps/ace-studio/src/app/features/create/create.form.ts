/**
 * @module create-form
 * @remarks Type-safe Angular generation form shared by beginner and expert modes.
 * @public
 */
import { FormBuilder, Validators } from "@angular/forms";

/** @public Construct the typed form, distinct from API serialization. */
export function createGenerationForm(fb: FormBuilder) {
  return fb.nonNullable.group({
    track_name: ["", [Validators.maxLength(120)]],
    target_stem: ["drums"],
    track_classes: [""],
    prompt: ["", [Validators.required, Validators.maxLength(5000)]],
    lyrics: [""],
    instrumental: [true],
    task_type: ["text2music"],
    model: [""],
    thinking: [false],
    use_format: [false],
    duration: [180, [Validators.min(10), Validators.max(600)]],
    bpm: [0, [Validators.min(0), Validators.max(300)]],
    key_scale: [""],
    time_signature: [""],
    vocal_language: ["en"],
    inference_steps: [8, [Validators.min(1), Validators.max(200)]],
    guidance_scale: [7, [Validators.min(0), Validators.max(30)]],
    batch_size: [1, [Validators.min(1), Validators.max(8)]],
    seed: [-1],
    use_random_seed: [true],
    audio_cover_strength: [1, [Validators.min(0), Validators.max(1)]],
    repainting_start: [0, [Validators.min(0)]],
    repainting_end: [30, [Validators.min(0)]],
    audio_format: ["mp3"]
  });
}

