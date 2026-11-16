/**
 * @module create-request-test
 * @remarks Pure request mapping parity with the existing ACE-Step API.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { CreateFormSnapshot, mapGenerateRequest } from "../../src/app/features/create/create.request";

const values: CreateFormSnapshot = {
  track_name: "Aerial", target_stem: "drums", track_classes: "",
  audio_code_string: "",
  global_caption: "", cover_noise_strength: 0, chunk_mask_mode: "auto",
  repaint_mode: "balanced", repaint_strength: 0.5,
  repaint_latent_crossfade_frames: 10, repaint_wav_crossfade_sec: 0,
  use_tiled_decode: true,
  prompt: " Deep ambient music ", lyrics: "",
  instrumental: true, task_type: "text2music", model: "",
  thinking: false, sample_mode: false, use_format: false, duration: 180, bpm: 0,
  key_scale: "", time_signature: "", vocal_language: "en",
  inference_steps: 8, guidance_scale: 7, batch_size: 2,
  seed: 12345, use_random_seed: true, audio_cover_strength: 1,
  repainting_start: 0, repainting_end: 30, audio_format: "mp3",
  infer_method: "ode", shift: 3, timesteps: "", use_adg: false,
  cfg_interval_start: 0, cfg_interval_end: 1, dcw_override: "auto",
  dcw_mode: "double", dcw_scaler: 0.05, dcw_high_scaler: 0.02,
  dcw_wavelet: "haar", use_cot_caption: false, use_cot_language: false,
  lm_temperature: 0.85, lm_cfg_scale: 2.5, lm_top_k: 0, lm_top_p: 0.9
};

describe("generation request mapping", () => {
  it("converts instrumental to the backend's recognized sentinel", () => {
    const req = mapGenerateRequest(values);
    expect(req.prompt).toBe("Deep ambient music");
    expect(req.lyrics).toBe("[inst]");
    expect(req.seed).toBe(-1);
    expect(req.bpm).toBeUndefined();
  });

  it("preserves fixed seeds and lyrical inputs without creating file paths", () => {
    const req = mapGenerateRequest({
      ...values, use_random_seed: false, instrumental: false,
      lyrics: "[Verse] Example", task_type: "repaint"
    });
    expect(req.seed).toBe(12345);
    expect(req.lyrics).toBe("[Verse] Example");
    expect(req.task_type).toBe("repaint");
    expect(Object.keys(req)).not.toContain("src_audio_path");
  });

  it("maps supported Extract and Lego stems to the backend instruction field", () => {
    expect(mapGenerateRequest({ ...values, task_type: "extract", target_stem: "vocals" })
      .track_name).toBe("vocals");
    expect(() => mapGenerateRequest({ ...values, task_type: "lego", target_stem: "invalid" }))
      .toThrow("stem");
  });

  it("maps Complete classes as a list, rejecting unsupported class names", () => {
    const req = mapGenerateRequest({
      ...values, task_type: "complete", track_classes: "drums, bass, drums"
    });
    expect(req.track_classes).toEqual(["drums", "bass"]);
    expect(() => mapGenerateRequest({
      ...values, task_type: "complete", track_classes: "alien_laser"
    })).toThrow("supported");
  });
  it("maps idea-only sample generation to the real 5Hz LM sample contract", () => {
    const request = mapGenerateRequest({
      ...values, task_type: "text2music", sample_mode: true,
      prompt: "polyrhythmic acoustic ensemble", instrumental: true
    });
    expect(request.sample_mode).toBe(true);
    expect(request.sample_query).toBe("polyrhythmic acoustic ensemble");
    expect(request.prompt).toBe("");
    expect(request.lyrics).toBe("");
  });
  it("does not accidentally enable sample mode for Cover or Repaint", () => {
    const request = mapGenerateRequest({ ...values, task_type: "cover", sample_mode: true });
    expect(request.sample_mode).toBe(false);
    expect(request.sample_query).toBeUndefined();
  });

  it("passes ephemeral semantic audio codes without persisting or generating yet", () => {
    const request = mapGenerateRequest({
      ...values, audio_code_string: "<|audio_semantic|>ABC"
    });
    expect(request.audio_code_string).toBe("<|audio_semantic|>ABC");
  });

  it("forbids code-control mixed with source editing or LM-generated codes", () => {
    expect(() => mapGenerateRequest({
      ...values, task_type: "cover", audio_code_string: "ABC"
    })).toThrow("audio codes");
    expect(() => mapGenerateRequest({
      ...values, thinking: true, audio_code_string: "ABC"
    })).toThrow("audio codes");
    expect(() => mapGenerateRequest({
      ...values, audio_code_string: "A".repeat(1_000_001)
    })).toThrow("1 MB");
  });

});




