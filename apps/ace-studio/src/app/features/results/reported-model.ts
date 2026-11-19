/**
 * @module reported-model
 * @remarks Compare server-reported DiT identity with the explicit submitted model.
 * @public
 */
import { StudioJob } from "../../core/api.types";

/** @public One validated mismatch between requested and server-reported model names. */
export interface ReportedModelMismatch {
  readonly requested: string;
  readonly actual: string;
}

const SAFE_MODEL_NAME = /^[A-Za-z0-9_.:-]{1,160}$/;

/**
 * @public Identify a model substitution using only authoritative result metadata.
 * @remarks Never infer the model from its task type, file name or server default.
 * Unknown model identity and session-restored jobs do not produce a warning.
 * @param job Finished job with an optional explicitly requested model.
 * @returns The first verified mismatch, or null when no discrepancy was reported.
 */
export function reportedModelMismatch(job: StudioJob): ReportedModelMismatch | null {
  const requested = job.request?.model;
  if (job.phase !== "succeeded" || !requested || !SAFE_MODEL_NAME.test(requested)) {
    return null;
  }
  for (const result of job.results) {
    const actual = result.metas?.["dit_model"];
    if (typeof actual === "string" && SAFE_MODEL_NAME.test(actual) && actual !== requested) {
      return { requested, actual };
    }
  }
  return null;
}
