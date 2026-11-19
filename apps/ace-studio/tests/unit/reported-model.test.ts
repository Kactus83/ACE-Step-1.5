/**
 * @module reported-model-tests
 * @remarks Never infer a model substitution from task type or missing backend metadata.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { StudioJob } from "../../src/app/core/api.types";
import { reportedModelMismatch } from "../../src/app/features/results/reported-model";

const sample: StudioJob = {
  id: "job-1", title: "Experiment", createdAt: 1,
  phase: "succeeded", progressText: "Done",
  request: {
    prompt: "Audio", lyrics: "[inst]", task_type: "text2music",
    model: "acestep-v15-turbo", thinking: false
  },
  results: [{ file: "/v1/audio?path=/safe.wav",
    metas: { dit_model: "acestep-v15-base" } }]
};

describe("actual DiT provenance", () => {
  it("flags only a real backend-reported difference from an explicit model", () => {
    expect(reportedModelMismatch(sample)).toEqual({
      requested: "acestep-v15-turbo", actual: "acestep-v15-base"
    });
  });
  it("does not fabricate model identity when none was reported", () => {
    expect(reportedModelMismatch({ ...sample, results: [
      { file: "/v1/audio?path=/safe.wav", metas: { bpm: 90 } }
    ] })).toBeNull();
    expect(reportedModelMismatch({ ...sample, request: undefined })).toBeNull();
    expect(reportedModelMismatch({ ...sample, request: {
      ...sample.request!, model: undefined
    } })).toBeNull();
  });
  it("does not flag same-model or incomplete generation", () => {
    expect(reportedModelMismatch({ ...sample, results: [
      { file: "file", metas: { dit_model: "acestep-v15-turbo" } }
    ] })).toBeNull();
    expect(reportedModelMismatch({ ...sample, phase: "running" })).toBeNull();
  });
  it("never echoes untrusted or path-shaped backend model identifiers", () => {
    expect(reportedModelMismatch({ ...sample, results: [
      { file: "file", metas: { dit_model: "/private/backend/path" } }
    ] })).toBeNull();
    expect(reportedModelMismatch({ ...sample, results: [
      { file: "file", metas: { dit_model: "bad\nname" } }
    ] })).toBeNull();
    expect(reportedModelMismatch({ ...sample, results: [
      { file: "file", metas: { dit_model: "x".repeat(161) } }
    ] })).toBeNull();
  });
});
