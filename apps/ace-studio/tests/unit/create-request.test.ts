/** @module create-request-test @remarks Request mapper parity with the audited server DTO. */
import { describe, expect, it } from "vitest";
import { CreateFormSnapshot, mapGenerateRequest } from "../../src/app/features/create/create.request";

const values: CreateFormSnapshot = {
  track_name: "Aerial", prompt: " Deep ambient music ", lyrics: "",
  instrumental: true, task_type: "text2music", model: "",
  thinking: false, use_format: false, duration: 180, bpm: 0,
  key_scale: "", time_signature: "", vocal_language: "en",
  inference_steps: 8, guidance_scale: 7, batch_size: 2,
  seed: 12345, use_random_seed: true, audio_cover_strength: 1,
  repainting_start: 0, repainting_end: 30, audio_format: "mp3"
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
});
