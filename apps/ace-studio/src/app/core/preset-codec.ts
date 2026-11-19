/**
 * @module preset-codec
 * @remarks Versioned, whitelist-validated serialization of nonsensitive form settings.
 * @public
 */

/** @public A single local form preset, excluding audio data and API credentials. */
export interface StudioPreset {
  readonly id: string;
  readonly name: string;
  readonly updatedAt: number;
  readonly fields: Readonly<Record<string, string | number | boolean>>;
}

const STRING_KEYS = new Set([
  "track_name", "prompt", "lyrics", "task_type", "model", "key_scale",
  "time_signature", "vocal_language", "audio_format", "target_stem", "track_classes",
  "infer_method", "timesteps", "dcw_override", "dcw_mode", "dcw_wavelet",
  "global_caption", "chunk_mask_mode", "repaint_mode"
]);
const NUMBER_KEYS = new Set([
  "duration", "bpm", "inference_steps", "guidance_scale", "batch_size",
  "seed", "audio_cover_strength", "repainting_start", "repainting_end",
  "shift", "cfg_interval_start", "cfg_interval_end", "dcw_scaler",
  "dcw_high_scaler", "lm_temperature", "lm_cfg_scale", "lm_top_k", "lm_top_p",
  "cover_noise_strength", "repaint_strength", "repaint_latent_crossfade_frames",
  "repaint_wav_crossfade_sec"
]);
const BOOLEAN_KEYS = new Set([
  "instrumental", "thinking", "sample_mode", "use_format", "use_random_seed",
  "use_adg", "use_cot_caption", "use_cot_language", "use_tiled_decode"
]);

/**
 * @public Strip unrecognized keys, sensitive fields and incorrect types.
 * @remarks Whitelisting prevents prototype keys or API credentials leaking to localStorage.
 */
export function sanitizeFields(input: unknown): Record<string, string | number | boolean> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const source = input as Record<string, unknown>;
  const fields: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(source)) {
    if (STRING_KEYS.has(key) && typeof value === "string" && value.length <= 20000) {
      fields[key] = value;
    } else if (NUMBER_KEYS.has(key) && typeof value === "number" && Number.isFinite(value)) {
      fields[key] = value;
    } else if (BOOLEAN_KEYS.has(key) && typeof value === "boolean") {
      fields[key] = value;
    }
  }
  return fields;
}

/**
 * @public Decode a bounded localStorage snapshot, ignoring corrupt entries.
 * @remarks Version 1 objects are the only currently supported persistence contract.
 */
export function decodePresets(raw: unknown): readonly StudioPreset[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const snapshot = raw as Record<string, unknown>;
  if (snapshot["version"] !== 1 || !Array.isArray(snapshot["items"])) return [];
  const result: StudioPreset[] = [];
  for (const item of snapshot["items"].slice(0, 50) as unknown[]) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const entry = item as Record<string, unknown>;
    if (typeof entry["id"] !== "string" || entry["id"].length > 80
      || typeof entry["name"] !== "string" || entry["name"].length > 80
      || typeof entry["updatedAt"] !== "number") continue;
    const fields = sanitizeFields(entry["fields"]);
    if (typeof fields["prompt"] !== "string") continue;
    result.push({ id: entry["id"], name: entry["name"],
      updatedAt: entry["updatedAt"], fields });
  }
  return result;
}




