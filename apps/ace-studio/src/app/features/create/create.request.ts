/**
 * @module create-request
 * @remarks Pure mapper from typed Angular form values to the real ACE-Step request DTO.
 * @public
 */
import { GenerateRequest, TaskType } from "../../core/api.types";
import { ExpertSnapshot, mapExpertRequest } from "./expert.request";
import { SourceEditSnapshot, mapSourceEditRequest } from "./source-edit.request";

/** @public Raw form snapshot independent from the Angular control implementation. */
export interface CreateFormSnapshot extends ExpertSnapshot, SourceEditSnapshot {
  readonly track_name: string;
  readonly target_stem: string;
  readonly track_classes: string;
  readonly prompt: string;
  readonly lyrics: string;
  readonly instrumental: boolean;
  readonly task_type: string;
  readonly model: string;
  readonly thinking: boolean;
  readonly sample_mode: boolean;
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

/** @public Instrument names exposed by ACE-Step in acestep/constants.py. */
export const TRACK_NAMES = [
  "woodwinds", "brass", "fx", "synth", "strings", "percussion",
  "keyboard", "guitar", "bass", "drums", "backing_vocals", "vocals"
] as const;

/**
 * @public Assemble the API request without media bytes, tokens or local paths.
 * @throws Error on unsupported stems or completion classes.
 */
export function mapGenerateRequest(value: CreateFormSnapshot): GenerateRequest {
  const mode = value.task_type as TaskType;
  const needsStem = mode === "extract" || mode === "lego";
  const sample = mode === "text2music" && value.sample_mode;
  if (needsStem && !TRACK_NAMES.some(name => name === value.target_stem)) {
    throw new Error("Choose a supported instrument stem.");
  }
  const classes = mode === "complete"
    ? [...new Set(value.track_classes.split(/[,\n]+/).map(name => name.trim().toLowerCase())
      .filter(Boolean))] : [];
  if (classes.some(name => !TRACK_NAMES.some(allowed => allowed === name))) {
    throw new Error("Completion classes must use supported ACE-Step track names.");
  }
  return {
    prompt: sample ? "" : value.prompt.trim(),
    lyrics: sample ? "" : value.instrumental ? "[inst]" : value.lyrics,
    sample_mode: sample,
    sample_query: sample ? value.prompt.trim() : undefined,
    task_type: mode,
    model: value.model || undefined,
    thinking: value.thinking,
    use_format: value.use_format,
    track_name: needsStem ? value.target_stem : value.track_name || undefined,
    track_classes: classes.length ? classes : undefined,
    ...mapExpertRequest(value),
    ...mapSourceEditRequest(mode, value),
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





