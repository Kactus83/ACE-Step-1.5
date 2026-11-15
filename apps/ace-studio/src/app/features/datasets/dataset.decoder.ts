/**
 * @module dataset-decoder
 * @remarks Runtime validation for untrusted dataset responses and safe sample updates.
 * @public
 */
import { isObject } from "../../core/api-decoder";
import { DatasetOverview, DatasetSample, UpdateSampleRequest } from "./dataset.contracts";

function textValue(obj: Record<string, unknown>, key: string): string {
  const value = obj[key];
  return typeof value === "string" ? value : "";
}

function naturalNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

/**
 * @public Decode one server dataset sample without trusting its shape or index.
 * @throws Error when its identity or essential file metadata is malformed.
 */
export function decodeSample(raw: unknown): DatasetSample {
  if (!isObject(raw) || !Number.isSafeInteger(raw["index"])
    || (raw["index"] as number) < 0 || typeof raw["filename"] !== "string") {
    throw new Error("Invalid dataset sample response.");
  }
  const rawBpm = raw["bpm"];
  return {
    index: raw["index"] as number,
    filename: raw["filename"],
    audio_path: textValue(raw, "audio_path"),
    duration: naturalNumber(raw["duration"]),
    caption: textValue(raw, "caption"),
    genre: textValue(raw, "genre"),
    prompt_override: typeof raw["prompt_override"] === "string"
      ? raw["prompt_override"] : null,
    lyrics: textValue(raw, "lyrics"),
    bpm: typeof rawBpm === "number" && Number.isFinite(rawBpm) ? rawBpm : null,
    keyscale: textValue(raw, "keyscale"),
    timesignature: textValue(raw, "timesignature"),
    language: textValue(raw, "language"),
    is_instrumental: raw["is_instrumental"] === true,
    labeled: raw["labeled"] === true
  };
}

/**
 * @public Validate the full /v1/dataset/samples response before displaying/editing.
 * @throws Error on unexpected payloads or repeated sample indexes.
 */
export function decodeDataset(raw: unknown): DatasetOverview {
  if (!isObject(raw) || typeof raw["dataset_name"] !== "string"
    || !Array.isArray(raw["samples"]) || !Number.isSafeInteger(raw["num_samples"])
    || !Number.isSafeInteger(raw["labeled_count"])) {
    throw new Error("Invalid ACE-Step dataset response.");
  }
  const samples = raw["samples"].map((sample: unknown) => decodeSample(sample));
  const indices = new Set(samples.map((sample: DatasetSample) => sample.index));
  if (indices.size !== samples.length || raw["num_samples"] !== samples.length) {
    throw new Error("Dataset sample count or index mismatch.");
  }
  return {
    dataset_name: raw["dataset_name"],
    num_samples: raw["num_samples"] as number,
    labeled_count: raw["labeled_count"] as number,
    samples
  };
}

/**
 * @public Build one exact update DTO, without writing the server's audio path.
 * @throws Error for invalid index/BPM inputs.
 */
export function updateSampleDto(
  sample: DatasetSample, changes: Omit<UpdateSampleRequest, "sample_idx">
): UpdateSampleRequest {
  if (!Number.isSafeInteger(sample.index) || sample.index < 0) {
    throw new Error("Invalid sample index.");
  }
  if (changes.bpm !== null && (!Number.isInteger(changes.bpm)
    || changes.bpm < 1 || changes.bpm > 400)) {
    throw new Error("BPM must be empty or an integer between 1 and 400.");
  }
  return { ...changes, sample_idx: sample.index };
}

