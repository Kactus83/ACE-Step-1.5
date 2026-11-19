/**
 * @module comparison-options-tests
 * @remarks Safe option assembly from server-scoped session and catalog references.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { comparisonOptions } from "../../src/app/features/results/comparison-options";
import { StudioJob } from "../../src/app/core/api.types";
import { LibraryProject } from "../../src/app/features/library/library.types";

const fileA = "/v1/audio?path=%2Fmock%2Fa.wav";
const fileB = "/v1/audio?path=%2Fmock%2Fb.wav";
const job: StudioJob = {
  id: "j", title: "Example", createdAt: 1, phase: "succeeded",
  progressText: "Done", results: [{ file: fileA, seed_value: "42" }]
};
const saved: LibraryProject = {
  id: "project", name: "Library", description: "",
  createdAt: 1, updatedAt: 1, tracks: [{
    id: "audio", jobId: "old", variant: 2, title: "Saved",
    savedAt: 2, backend: "http://localhost:8001", favorite: true,
    note: "", tags: [], result: { file: fileB }
  }]
};

describe("A/B comparison choices", () => {
  it("includes queue and explicit local bookmarks for the current backend", () => {
    const options = comparisonOptions([job], [saved], "http://localhost:8001");
    expect(options).toHaveLength(2);
    expect(options[0]?.seed).toBe("42");
    expect(options[1]?.source).toBe("library");
  });

  it("filters failed jobs, mismatched backend bookmarks and unsafe URLs", () => {
    const failed: StudioJob = { ...job, phase: "failed" };
    expect(comparisonOptions([failed], [saved], "https://example.com")).toHaveLength(0);
    const unsafe: StudioJob = { ...job, results: [
      { file: "https://bad.test/v1/audio?path=x" }
    ] };
    expect(comparisonOptions([unsafe], [], "http://localhost:8001")).toHaveLength(0);
  });
});

