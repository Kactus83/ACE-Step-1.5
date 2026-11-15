/**
 * @module expert-request
 * @remarks Verified expert settings for the ACE-Step /release_task builder.
 * @public
 */
import { GenerateRequest } from "../../core/api.types";

/** @public Form fields that tune backend diffusion and 5Hz language-model work. */
export interface ExpertSnapshot {
  readonly infer_method: string;
  readonly shift: number;
  readonly timesteps: string;
  readonly use_adg: boolean;
  readonly cfg_interval_start: number;
  readonly cfg_interval_end: number;
  readonly dcw_override: string;
  readonly dcw_mode: string;
  readonly dcw_scaler: number;
  readonly dcw_high_scaler: number;
  readonly dcw_wavelet: string;
  readonly use_cot_caption: boolean;
  readonly use_cot_language: boolean;
  readonly lm_temperature: number;
  readonly lm_cfg_scale: number;
  readonly lm_top_k: number;
  readonly lm_top_p: number;
}

/**
 * @public Parse user-supplied custom diffusion schedule.
 * @returns Canonical comma-separated values or undefined when no override is set.
 * @throws Error if values are malformed, outside [0,1], or not descending.
 */
export function normalizeTimesteps(text: string): string | undefined {
  if (!text.trim()) return undefined;
  const parts = text.split(",").map(part => part.trim());
  if (parts.length < 2 || parts.length > 128
    || parts.some(part => !/^(?:0(?:\.\d+)?|1(?:\.0+)?)$/.test(part))) {
    throw new Error("Timesteps must contain 2–128 comma-separated values between 0 and 1.");
  }
  const values = parts.map(Number);
  if (values.some((value, i) => i > 0 && value >= values[i - 1]!)) {
    throw new Error("Custom timesteps must be strictly descending.");
  }
  return values.join(",");
}

/**
 * @public Convert validated expert form values into supported API request fields.
 * @remarks Undefined DCW flag is intentionally omitted to preserve the server's
 * model-specific default; never infer turbo from model-name substrings.
 * @throws Error for invalid, nonfinite, or conflicting values.
 */
export function mapExpertRequest(raw: ExpertSnapshot): Partial<GenerateRequest> {
  const bounded = (value: number, min: number, max: number, label: string) => {
    if (!Number.isFinite(value) || value < min || value > max) {
      throw new Error(label + " must be within " + min + "–" + max + ".");
    }
    return value;
  };
  if (!["ode", "sde"].includes(raw.infer_method)) {
    throw new Error("Unknown diffusion inference method.");
  }
  if (raw.cfg_interval_start >= raw.cfg_interval_end) {
    throw new Error("CFG interval start must be before its end.");
  }
  if (!["auto", "on", "off"].includes(raw.dcw_override)) {
    throw new Error("Unknown DCW override.");
  }
  if (!["low", "high", "double", "pix"].includes(raw.dcw_mode)) {
    throw new Error("Unknown DCW wavelet mode.");
  }
  if (!["haar", "db4", "sym8"].includes(raw.dcw_wavelet)) {
    throw new Error("Choose a supported DCW wavelet.");
  }
  if (!Number.isInteger(raw.lm_top_k)) throw new Error("LM top-k must be an integer.");
  const result: Partial<GenerateRequest> = {
    infer_method: raw.infer_method as "ode" | "sde",
    shift: bounded(raw.shift, 1, 5, "Timestep shift"),
    timesteps: normalizeTimesteps(raw.timesteps),
    use_adg: raw.use_adg,
    cfg_interval_start: bounded(raw.cfg_interval_start, 0, 1, "CFG start"),
    cfg_interval_end: bounded(raw.cfg_interval_end, 0, 1, "CFG end"),
    use_cot_caption: raw.use_cot_caption,
    use_cot_language: raw.use_cot_language,
    lm_temperature: bounded(raw.lm_temperature, 0.05, 2, "LM temperature"),
    lm_cfg_scale: bounded(raw.lm_cfg_scale, 0, 20, "LM CFG scale"),
    lm_top_k: bounded(raw.lm_top_k, 0, 10000, "LM top-k") || undefined,
    lm_top_p: bounded(raw.lm_top_p, 0.01, 0.99, "LM top-p")
  };
  if (raw.dcw_override !== "auto") {
    result.dcw_enabled = raw.dcw_override === "on";
  }
  if (raw.dcw_override === "on") {
    result.dcw_mode = raw.dcw_mode as "low" | "high" | "double" | "pix";
    result.dcw_scaler = bounded(raw.dcw_scaler, 0, 1, "DCW low scaler");
    result.dcw_high_scaler = bounded(raw.dcw_high_scaler, 0, 1, "DCW high scaler");
    result.dcw_wavelet = raw.dcw_wavelet;
  }
  return result;
}

