/**
 * @module restore-request
 * @remarks Invert supported generation request fields to a typed user-editable form.
 * This operation restores parameters only; never claims to restore media.
 * @public
 */
import { GenerateRequest } from "../../core/api.types";
import { createGenerationForm } from "./create.form";

type Values = ReturnType<ReturnType<typeof createGenerationForm>["getRawValue"]>;

/**
 * @public Restore an in-memory job request without invoking a backend operation.
 * @remarks Unknown or absent fields retain the form's defaults via patchValue.
 */
export function restoreGenerateRequest(
  request: GenerateRequest, displayTitle = ""
): Partial<Values> {
  const hasStem = request.task_type === "extract" || request.task_type === "lego";
  return {
    track_name: displayTitle.slice(0, 120),
    target_stem: hasStem ? request.track_name || "drums" : "drums",
    track_classes: request.track_classes?.join(", ") || "",
    global_caption: request.global_caption ?? "",
    cover_noise_strength: request.cover_noise_strength ?? 0,
    chunk_mask_mode: request.chunk_mask_mode ?? "auto",
    repaint_mode: request.repaint_mode ?? "balanced",
    repaint_strength: request.repaint_strength ?? 0.5,
    repaint_latent_crossfade_frames: request.repaint_latent_crossfade_frames ?? 10,
    repaint_wav_crossfade_sec: request.repaint_wav_crossfade_sec ?? 0,
    use_tiled_decode: request.use_tiled_decode ?? true,
    prompt: request.sample_mode ? request.sample_query || "" : request.prompt,
    lyrics: request.lyrics === "[inst]" ? "" : request.lyrics,
    instrumental: request.lyrics === "[inst]" || request.lyrics === "[Instrumental]",
    task_type: request.task_type,
    model: request.model || "",
    thinking: request.thinking,
    sample_mode: request.sample_mode ?? false,
    use_format: request.use_format ?? false,
    duration: request.audio_duration ?? 180,
    bpm: request.bpm ?? 0,
    key_scale: request.key_scale || "",
    time_signature: request.time_signature || "",
    vocal_language: request.vocal_language || "en",
    inference_steps: request.inference_steps ?? 8,
    guidance_scale: request.guidance_scale ?? 7,
    batch_size: request.batch_size ?? 1,
    seed: request.seed ?? -1,
    use_random_seed: request.use_random_seed ?? true,
    audio_cover_strength: request.audio_cover_strength ?? 1,
    repainting_start: request.repainting_start ?? 0,
    repainting_end: request.repainting_end ?? 30,
    audio_format: request.audio_format ?? "mp3",
    infer_method: request.infer_method ?? "ode",
    shift: request.shift ?? 3,
    timesteps: request.timesteps ?? "",
    use_adg: request.use_adg ?? false,
    cfg_interval_start: request.cfg_interval_start ?? 0,
    cfg_interval_end: request.cfg_interval_end ?? 1,
    dcw_override: request.dcw_enabled === undefined ? "auto"
      : request.dcw_enabled ? "on" : "off",
    dcw_mode: request.dcw_mode ?? "double",
    dcw_scaler: request.dcw_scaler ?? 0.05,
    dcw_high_scaler: request.dcw_high_scaler ?? 0.02,
    dcw_wavelet: request.dcw_wavelet ?? "haar",
    use_cot_caption: request.use_cot_caption ?? false,
    use_cot_language: request.use_cot_language ?? false,
    lm_temperature: request.lm_temperature ?? 0.85,
    lm_cfg_scale: request.lm_cfg_scale ?? 2.5,
    lm_top_k: request.lm_top_k ?? 0,
    lm_top_p: request.lm_top_p ?? 0.9
  };
}

/**
 * @public Prefer an actual server variant seed for an editable repeat request.
 * @remarks The value must be an exactly representable safe integer; no GPU launch.
 */
export function withResultSeed(
  request: GenerateRequest, rawSeed: string | undefined
): GenerateRequest {
  if (!rawSeed || !/^[0-9]{1,16}$/.test(rawSeed.trim())) return request;
  const seed = Number(rawSeed.trim());
  return Number.isSafeInteger(seed) && seed >= 0
    ? { ...request, seed, use_random_seed: false } : request;
}



