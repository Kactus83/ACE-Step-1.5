/**
 * @module source-edit-request-test
 * @remarks ACE-Step source-conditioned audio parameters are mode-scoped and bounded.
 * @internal
 */
import { describe, expect, it } from "vitest";
import {
  SourceEditSnapshot, mapSourceEditRequest
} from "../../src/app/features/create/source-edit.request";

const values: SourceEditSnapshot = {
  global_caption: " Full composition context ",
  cover_noise_strength: 0.4,
  chunk_mask_mode: "explicit", repaint_latent_crossfade_frames: 25,
  repaint_wav_crossfade_sec: 0.75, repaint_mode: "balanced",
  repaint_strength: 0.65, use_tiled_decode: false
};

describe("source audio transformation mapping", () => {
  it("does not forward source-only fields for text generation", () => {
    expect(mapSourceEditRequest("text2music", values))
      .toEqual({ use_tiled_decode: false });
  });
  it("forwards full-song Lego context, not unused cover settings", () => {
    expect(mapSourceEditRequest("lego", values)).toEqual({
      use_tiled_decode: false, global_caption: "Full composition context"
    });
  });
  it("forwards cover noise without repaint-only parameters", () => {
    expect(mapSourceEditRequest("cover", values)).toEqual({
      use_tiled_decode: false, cover_noise_strength: 0.4
    });
  });
  it("supports balanced Repaint crossfades and source preservation", () => {
    const result = mapSourceEditRequest("repaint", values);
    expect(result.repaint_mode).toBe("balanced");
    expect(result.repaint_strength).toBe(0.65);
    expect(result.repaint_latent_crossfade_frames).toBe(25);
    expect(result.repaint_wav_crossfade_sec).toBe(0.75);
    expect(result.chunk_mask_mode).toBe("explicit");
  });
  it("omits balanced-only strength for conservative repaint", () => {
    const value = mapSourceEditRequest("repaint",
      { ...values, repaint_mode: "conservative" });
    expect(value.repaint_strength).toBeUndefined();
  });
  it("rejects invalid or nonfinite transformation parameters", () => {
    expect(() => mapSourceEditRequest("repaint",
      { ...values, repaint_wav_crossfade_sec: Infinity })).toThrow("crossfade");
    expect(() => mapSourceEditRequest("repaint",
      { ...values, repaint_latent_crossfade_frames: 1.5 })).toThrow("integer");
  });
});

