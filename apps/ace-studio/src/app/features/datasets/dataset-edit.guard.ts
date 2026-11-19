/**
 * @module dataset-edit-guard
 * @remarks Best-effort optimistic checks for a single server-global dataset editor.
 * @public
 */
import { DatasetOverview, DatasetSample } from "./dataset.contracts";

/** @public Fields whose changes could silently overwrite another operator's work. */
export function sampleSnapshot(sample: DatasetSample): string {
  return JSON.stringify([
    sample.index, sample.filename, sample.audio_path,
    sample.caption, sample.genre, sample.prompt_override, sample.lyrics,
    sample.bpm, sample.keyscale, sample.timesignature, sample.language,
    sample.is_instrumental, sample.labeled
  ]);
}

/**
 * @public Ensure the same file and metadata are still server-current.
 * @throws Error when another operator edited or replaced the active dataset.
 * @remarks The backend lacks revision/ETag CAS; this cannot guarantee atomicity.
 */
export function assertSampleUnchanged(
  expected: DatasetSample, current: DatasetOverview
): void {
  const actual = current.samples.find(sample => sample.index === expected.index);
  if (!actual || sampleSnapshot(actual) !== sampleSnapshot(expected)) {
    throw new Error(
      "Dataset conflict: the selected server sample changed since you opened it. " +
      "Refresh the dataset and review the latest metadata before trying again."
    );
  }
}

