/**
 * @module job-result-reducer
 * @remarks Pure translation of one task response into one local Studio job.
 * @public
 */
import { decodeTask } from "./api-decoder";
import { decodeAnalysisResult } from "./analysis-result";
import { StudioJob, TaskRecordDto } from "./api.types";

/**
 * @public Apply a server task record without modifying the original job.
 * @remarks Malformed result data stays unknown and never becomes a fabricated success.
 * @param job Current session job with optional in-memory request metadata.
 * @param raw Backend task record for the same job identifier.
 * @returns New normalized job snapshot, or an unknown-phase diagnostic.
 */
export function applyTaskRecord(job: StudioJob, raw: TaskRecordDto): StudioJob {
  try {
    const next = decodeTask(raw);
    const analysis = decodeAnalysisResult(raw, job.request, job.analysisMode);
    return {
      ...job, phase: next.phase, results: next.results, analysis,
      progressText: next.progressText || job.progressText,
      error: next.results.find(result => result.error)?.error || undefined
    };
  } catch (error: unknown) {
    return {
      ...job, phase: "unknown",
      progressText: error instanceof Error ? error.message : "Malformed result"
    };
  }
}
