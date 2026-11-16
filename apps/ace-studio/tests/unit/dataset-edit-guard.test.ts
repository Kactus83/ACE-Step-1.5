/**
 * @module dataset-edit-guard-tests
 * @remarks Block edits against changed server-global sample state.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { assertSampleUnchanged } from "../../src/app/features/datasets/dataset-edit.guard";
import { DatasetOverview, DatasetSample } from "../../src/app/features/datasets/dataset.contracts";

const sample: DatasetSample = {
  index: 0, filename: "source.wav", audio_path: "/data/source.wav", duration: 30,
  caption: "Old caption", genre: "ambient", prompt_override: null,
  lyrics: "", bpm: 110, keyscale: "A minor", timesignature: "4/4",
  language: "en", is_instrumental: true, labeled: true
};
const overview = (s: DatasetSample): DatasetOverview => ({
  dataset_name: "mock", num_samples: 1, labeled_count: 1, samples: [s]
});

describe("server-global dataset edit checks", () => {
  it("accepts exactly the baseline sample before a write", () => {
    expect(() => assertSampleUnchanged(sample, overview({ ...sample }))).not.toThrow();
  });
  it("rejects another operator's edits instead of overwriting them", () => {
    expect(() => assertSampleUnchanged(sample,
      overview({ ...sample, caption: "Another editor's changes" }))).toThrow("conflict");
  });
  it("rejects changed sample indexing and replaced audio on the backend", () => {
    expect(() => assertSampleUnchanged(sample,
      overview({ ...sample, filename: "replacement.wav" }))).toThrow("conflict");
    expect(() => assertSampleUnchanged(sample, { ...overview(sample), samples: [] }))
      .toThrow("conflict");
  });
});

