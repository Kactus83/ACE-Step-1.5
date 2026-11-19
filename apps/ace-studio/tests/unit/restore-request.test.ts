/**
 * @module restore-request-tests
 * @remarks Pure source-setting restoration with explicit reproducibility limits.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { GenerateRequest } from "../../src/app/core/api.types";
import { decodeTask } from "../../src/app/core/api-decoder";
import {
  restoreGenerateRequest, withResultSeed
} from "../../src/app/features/create/restore-request";

const request: GenerateRequest = {
  prompt: "Hypnotic textured pads", lyrics: "[inst]", thinking: false,
  task_type: "text2music", model: "acestep-v15-turbo", audio_format: "flac",
  use_random_seed: true, seed: -1, dcw_enabled: false
};

describe("reusing generation settings", () => {
  it("restores actual request values without starting generation", () => {
    const fields = restoreGenerateRequest(request, "Soft pulse");
    expect(fields.prompt).toBe(request.prompt);
    expect(fields.track_name).toBe("Soft pulse");
    expect(fields.instrumental).toBe(true);
    expect(fields.audio_format).toBe("flac");
    expect(fields.dcw_override).toBe("off");
  });

  it("recovers a selected instrumental stem separately from human job title", () => {
    const values = restoreGenerateRequest({
      ...request, task_type: "extract", track_name: "vocals"
    }, "Singer and ambience");
    expect(values.target_stem).toBe("vocals");
    expect(values.track_name).toBe("Singer and ambience");
  });

  it("uses the actual seed of the selected backend audio variant", () => {
    const result = decodeTask({
      task_id: "batch", status: 1, result: JSON.stringify([
        { file: "/v1/audio?path=first", seed_value: "11" },
        { file: "/v1/audio?path=second", seed_value: "22" }
      ])
    });
    const second = withResultSeed(request, result.results[1]?.seed_value);
    expect(second.seed).toBe(22);
    expect(second.use_random_seed).toBe(false);
    expect(request.seed).toBe(-1);
  });

  it("retains an exact numeric server seed without faking reproducibility", () => {
    const seeded = withResultSeed(request, "12345");
    expect(seeded.use_random_seed).toBe(false);
    expect(seeded.seed).toBe(12345);
    expect(withResultSeed(request, "nan")).toBe(request);
    expect(withResultSeed(request, "9007199254740999")).toBe(request);
  });
});

