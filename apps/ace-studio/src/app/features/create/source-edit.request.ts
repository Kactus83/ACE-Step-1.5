/**
 * @module source-edit-request
 * @remarks Verified ACE-Step source-conditioned generation fields, independent of UI.
 * @public
 */
import { GenerateRequest, TaskType } from "../../core/api.types";

/** @public Typed form controls for source conditioning and preservation. */
export interface SourceEditSnapshot {
  readonly global_caption: string;
  readonly cover_noise_strength: number;
  readonly chunk_mask_mode: string;
  readonly repaint_latent_crossfade_frames: number;
  readonly repaint_wav_crossfade_sec: number;
  readonly repaint_mode: string;
  readonly repaint_strength: number;
  readonly use_tiled_decode: boolean;
}

function bound(value: number, min: number, max: number, label: string): number {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(label + " must be between " + min + " and " + max + ".");
  }
  return value;
}

/**
 * @public Map exactly supported audio transformation parameters.
 * @remarks Inapplicable controls are omitted so they cannot alter another mode.
 * @throws Error for invalid modes, finite bounds or crossfade settings.
 */
export function mapSourceEditRequest(
  mode: TaskType, value: SourceEditSnapshot
): Partial<GenerateRequest> {
  const common: Partial<GenerateRequest> = {
    use_tiled_decode: value.use_tiled_decode
  };
  if (mode === "lego" && value.global_caption.trim()) {
    common.global_caption = value.global_caption.trim().slice(0, 5000);
  }
  if (mode !== "cover" && mode !== "repaint") return common;
  const cover: Partial<GenerateRequest> = {
    cover_noise_strength: bound(value.cover_noise_strength, 0, 1, "Cover noise strength")
  };
  if (mode !== "repaint") return { ...common, ...cover };
  if (!["explicit", "auto"].includes(value.chunk_mask_mode)) {
    throw new Error("Unknown repaint chunk mask mode.");
  }
  if (!["conservative", "balanced", "aggressive"].includes(value.repaint_mode)) {
    throw new Error("Unknown repaint preservation mode.");
  }
  const frames = bound(value.repaint_latent_crossfade_frames, 0, 250,
    "Latent crossfade frames");
  if (!Number.isInteger(frames)) throw new Error("Latent crossfade frames must be an integer.");
  return {
    ...common, ...cover,
    chunk_mask_mode: value.chunk_mask_mode as "explicit" | "auto",
    repaint_mode: value.repaint_mode as "conservative" | "balanced" | "aggressive",
    repaint_latent_crossfade_frames: frames,
    repaint_wav_crossfade_sec: bound(value.repaint_wav_crossfade_sec, 0, 10,
      "Waveform crossfade"),
    ...(value.repaint_mode === "balanced"
      ? { repaint_strength: bound(value.repaint_strength, 0, 1, "Repaint strength") } : {})
  };
}

