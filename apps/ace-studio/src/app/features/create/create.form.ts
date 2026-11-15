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
    global_caption: ["", [Validators.maxLength(5000)]],
    cover_noise_strength: [0, [Validators.min(0), Validators.max(1)]],
    chunk_mask_mode: ["auto"],
    repaint_mode: ["balanced"],
    repaint_strength: [0.5, [Validators.min(0), Validators.max(1)]],
    repaint_latent_crossfade_frames: [10, [Validators.min(0), Validators.max(250)]],
    repaint_wav_crossfade_sec: [0, [Validators.min(0), Validators.max(10)]],
    use_tiled_decode: [true],
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
    audio_format: ["mp3"],
    infer_method: ["ode"],
    shift: [3, [Validators.min(1), Validators.max(5)]],
    timesteps: [""],
    use_adg: [false],
    cfg_interval_start: [0, [Validators.min(0), Validators.max(1)]],
    cfg_interval_end: [1, [Validators.min(0), Validators.max(1)]],
    dcw_override: ["auto"],
    dcw_mode: ["double"],
    dcw_scaler: [0.05, [Validators.min(0), Validators.max(1)]],
    dcw_high_scaler: [0.02, [Validators.min(0), Validators.max(1)]],
    dcw_wavelet: ["haar"],
    use_cot_caption: [false],
    use_cot_language: [false],
    lm_temperature: [0.85, [Validators.min(0.05), Validators.max(2)]],
    lm_cfg_scale: [2.5, [Validators.min(0), Validators.max(20)]],
    lm_top_k: [0, [Validators.min(0), Validators.max(10000)]],
    lm_top_p: [0.9, [Validators.min(0.01), Validators.max(0.99)]]
  });
}



