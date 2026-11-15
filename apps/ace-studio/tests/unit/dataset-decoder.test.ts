/** @module dataset-decoder-test @remarks Offline validation of the ACE-Step dataset contract. */
import { describe, expect, it } from "vitest";
import { decodeDataset, updateSampleDto } from "../../src/app/features/datasets/dataset.decoder";

const sample = {
  index: 0, filename: "song.wav", audio_path: "/srv/song.wav",
  duration: 42, caption: "lush textures", genre: "ambient", prompt_override: null,
  lyrics: "[Instrumental]", bpm: 105, keyscale: "A minor", timesignature: "4/4",
  language: "unknown", is_instrumental: true, labeled: false
};

describe("dataset API decoding", () => {
  it("accepts a real server-shaped dataset and retains sample indexes", () => {
    const result = decodeDataset({
      dataset_name: "example", num_samples: 1, labeled_count: 0, samples: [sample]
    });
    expect(result.samples[0]?.index).toBe(0);
    expect(result.samples[0]?.filename).toBe("song.wav");
  });

  it("rejects mismatched count and duplicate sample indexes", () => {
    expect(() => decodeDataset({
      dataset_name: "a", num_samples: 2, labeled_count: 1, samples: [sample]
    })).toThrow("mismatch");
    expect(() => decodeDataset({
      dataset_name: "a", num_samples: 2, labeled_count: 0, samples: [sample, sample]
    })).toThrow("mismatch");
  });

  it("rejects malformed sample data rather than inventing identities", () => {
    expect(() => decodeDataset({
      dataset_name: "x", num_samples: 1, labeled_count: 0, samples: [{ filename: "file" }]
    })).toThrow("Invalid dataset sample");
  });

  it("builds the exact sample update payload with backend index", () => {
    const [item] = decodeDataset({
      dataset_name: "x", num_samples: 1, labeled_count: 0, samples: [sample]
    }).samples;
    if (!item) throw new Error("Fixture missing");
    const payload = updateSampleDto(item, {
      caption: "new", genre: "", prompt_override: null, lyrics: "[Instrumental]",
      bpm: 110, keyscale: "", timesignature: "", language: "unknown",
      is_instrumental: true
    });
    expect(payload.sample_idx).toBe(0);
    expect(Object.keys(payload)).not.toContain("audio_path");
    expect(() => updateSampleDto(item, { ...payload, bpm: -2 })).toThrow("BPM");
  });
});

