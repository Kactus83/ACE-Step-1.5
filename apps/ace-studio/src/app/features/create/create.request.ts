/**
 * @module create-request
 * @remarks Pure mapper from typed Angular form values to the real ACE-Step request DTO.
 * @public
 */
import { GenerateRequest, TaskType } from "../../core/api.types";

/** @public Raw form snapshot independent from the Angular control implementation. */
export interface CreateFormSnapshot {
  readonly track_name: string;
  readonly prompt: string;
  readonly lyrics: string;
  readonly instrumental: boolean;
  readonly task_type: string;
  readonly model: string;
  readonly thinking: boolean;
  readonly use_format: boolean;
  readonly duration: number;
  readonly bpm: number;
  readonly key_scale: string;
  readonly time_signature: string;
  readonly vocal_language: string;
  readonly inference_steps: number;
  readonly guidance_scale: number;
  readonly batch_size: number;
  readonly seed: number;
  readonly use_random_seed: boolean;
  readonly audio_cover_strength: number;
  readonly repainting_start: number;
  readonly repainting_end: number;
  readonly audio_format: string;
}

/**
 * @public Assemble the API request without media bytes, tokens or local paths.
 * @remarks Invalid or unsupported mode values are blocked by the calling editor.
 */
export function mapGenerateRequest(value: CreateFormSnapshot): GenerateRequest {
  return {
    prompt: value.prompt.trim(),
    lyrics: value.instrumental ? "[inst]" : value.lyrics,
    task_type: value.task_type as TaskType,
    model: value.model || undefined,
    thinking: value.thinking,
    use_format: value.use_format,
    track_name: value.track_name || undefined,
    audio_duration: value.duration,
    bpm: value.bpm || undefined,
    key_scale: value.key_scale || undefined,
    time_signature: value.time_signature || undefined,
    vocal_language: value.vocal_language || "en",
    inference_steps: value.inference_steps,
    guidance_scale: value.guidance_scale,
    batch_size: value.batch_size,
    use_random_seed: value.use_random_seed,
    seed: value.use_random_seed ? -1 : value.seed,
    audio_cover_strength: value.audio_cover_strength,
    repainting_start: value.repainting_start,
    repainting_end: value.repainting_end,
    audio_format: value.audio_format as GenerateRequest["audio_format"]
  };
}
