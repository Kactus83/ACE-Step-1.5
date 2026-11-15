/**
 * @module api-types
 * @remarks Types only for the independently verified ACE-Step standalone FastAPI profile.
 * The backend remains authoritative; these interfaces do not assert Gradio API parity.
 * @public
 */

/** @public Shared legacy response envelope returned by ACE-Step. */
export interface ApiEnvelope<T> {
  readonly data: T;
  readonly code: number;
  readonly error: string | null;
  readonly timestamp?: number;
  readonly extra?: unknown;
}

/** @public Read-only backend readiness. */
export interface BackendHealth {
  readonly status: string;
  readonly service?: string;
  readonly version?: string;
  readonly models_initialized?: boolean;
  readonly llm_initialized?: boolean;
  readonly loaded_model?: string | null;
}

/** @public Queue and job counters reported by the Python server. */
export interface BackendStats {
  readonly jobs: Readonly<Record<string, number>>;
  readonly queue_size: number;
  readonly queue_maxsize: number;
  readonly avg_job_seconds: number;
}

/** @public Model inventory entry; task types are provided by the server. */
export interface AceModel {
  readonly name: string;
  readonly is_default?: boolean;
  readonly is_loaded?: boolean;
  readonly supported_task_types?: readonly string[];
}

/** @public Server inventory including optional 5Hz models. */
export interface ModelInventory {
  readonly models: readonly AceModel[];
  readonly default_model?: string | null;
  readonly lm_models?: readonly AceModel[];
  readonly llm_initialized?: boolean;
}

/** @public Supported known generation modes; API may add more in future. */
export type TaskType = "text2music" | "cover" | "repaint" | "lego" | "extract" | "complete";

/**
 * @public Serialized generation form for /release_task.
 * @remarks Deliberately excludes server filesystem paths. Local source uploads use multipart.
 */
export interface GenerateRequest {
  readonly prompt: string;
  readonly lyrics: string;
  readonly task_type: TaskType;
  readonly model?: string;
  readonly thinking: boolean;
  readonly audio_duration?: number;
  readonly bpm?: number;
  readonly key_scale?: string;
  readonly time_signature?: string;
  readonly vocal_language?: string;
  readonly inference_steps?: number;
  readonly guidance_scale?: number;
  readonly batch_size?: number;
  readonly use_random_seed?: boolean;
  readonly seed?: number;
  readonly repainting_start?: number;
  readonly repainting_end?: number;
  readonly audio_cover_strength?: number;
  readonly use_format?: boolean;
  readonly global_caption?: string;
  readonly cover_noise_strength?: number;
  readonly chunk_mask_mode?: "auto" | "explicit";
  readonly repaint_latent_crossfade_frames?: number;
  readonly repaint_wav_crossfade_sec?: number;
  readonly repaint_mode?: "conservative" | "balanced" | "aggressive";
  readonly repaint_strength?: number;
  readonly use_tiled_decode?: boolean;
  readonly track_name?: string;
  readonly track_classes?: readonly string[];
  readonly audio_format?: "mp3" | "wav" | "flac" | "opus" | "aac" | "wav32";
  readonly infer_method?: "ode" | "sde";
  readonly shift?: number;
  readonly timesteps?: string;
  readonly use_adg?: boolean;
  readonly cfg_interval_start?: number;
  readonly cfg_interval_end?: number;
  readonly dcw_enabled?: boolean;
  readonly dcw_mode?: "low" | "high" | "double" | "pix";
  readonly dcw_scaler?: number;
  readonly dcw_high_scaler?: number;
  readonly dcw_wavelet?: string;
  readonly use_cot_caption?: boolean;
  readonly use_cot_language?: boolean;
  readonly lm_temperature?: number;
  readonly lm_cfg_scale?: number;
  readonly lm_top_k?: number;
  readonly lm_top_p?: number;
}

/** @public Acknowledged queue position, not a finished generation. */
export interface SubmittedTask {
  readonly task_id: string;
  readonly status: string;
  readonly queue_position?: number;
}

/** @public Server-facing raw task lookup response. */
export interface TaskRecordDto {
  readonly task_id: string;
  readonly status: number;
  readonly result: unknown;
  readonly progress_text?: string;
}

/** @public Parsed audio result, including optional metadata. */
export interface GeneratedAudio {
  readonly file: string;
  readonly prompt?: string;
  readonly lyrics?: string;
  readonly status?: number;
  readonly seed_value?: string;
  readonly generation_info?: string;
  readonly metas?: Readonly<Record<string, unknown>>;
  readonly error?: string | null;
  readonly stage?: string;
  readonly progress?: number;
}

/** @public Client normalized job phase. */
export type JobPhase = "queued" | "running" | "succeeded" | "failed" | "unknown";

/** @public One client job and its reproducibility metadata. */
export interface StudioJob {
  readonly id: string;
  readonly title: string;
  readonly createdAt: number;
  readonly phase: JobPhase;
  readonly progressText: string;
  readonly error?: string;
  readonly results: readonly GeneratedAudio[];
  readonly request?: GenerateRequest;
  /** @public Source audio upload needed, but never persisted on the client. */
  readonly hasSourceAudio?: boolean;
  /** @public Reference audio upload needed, but never persisted on the client. */
  readonly hasReferenceAudio?: boolean;
}





