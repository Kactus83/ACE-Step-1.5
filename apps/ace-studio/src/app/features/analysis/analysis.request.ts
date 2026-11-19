/**
 * @module analysis-request
 * @remarks Exact standalone ACE-Step analysis flags, not audio generation.
 * @public
 */
import { GenerateRequest } from "../../core/api.types";

/** @public Available API analysis operations and their required inputs. */
export type AnalysisMode = "codes" | "deep" | "metadata";

/** @public User-supplied analysis inputs; media is handled separately. */
export interface AnalysisSnapshot {
  readonly mode: AnalysisMode;
  readonly model: string;
  readonly prompt: string;
  readonly lyrics: string;
}

/**
 * @public Map analysis actions to verified GenerateMusicRequest flags.
 * @param value - Current user-controlled analysis configuration.
 * @param hasSource - Whether a validated source file will be uploaded.
 * @param lmReady - Server-reported 5Hz LM initialization state.
 * @returns A non-generating analysis task request for the existing queue.
 * @throws Error for missing source, empty description, or unavailable LM.
 */
export function mapAnalysisRequest(
  value: AnalysisSnapshot, hasSource: boolean, lmReady: boolean
): GenerateRequest {
  if (!["codes", "deep", "metadata"].includes(value.mode)) {
    throw new Error("Unsupported audio analysis operation.");
  }
  if (value.mode !== "metadata" && !hasSource) {
    throw new Error("Choose source audio to analyze.");
  }
  if (value.mode !== "codes" && !lmReady) {
    throw new Error("Initialize the 5Hz language model explicitly in Connection first.");
  }
  if (value.mode === "metadata" && !value.prompt.trim()) {
    throw new Error("A music description is required for metadata analysis.");
  }
  return {
    task_type: "text2music",
    model: value.model.trim() || undefined,
    prompt: value.mode === "metadata" ? value.prompt.trim().slice(0, 5000) : "",
    lyrics: value.mode === "metadata" ? value.lyrics.slice(0, 10000) : "",
    thinking: false,
    sample_mode: false,
    analysis_only: value.mode === "metadata",
    full_analysis_only: value.mode === "deep",
    extract_codes_only: value.mode === "codes",
    batch_size: 1,
    use_random_seed: true,
    seed: -1
  };
}

