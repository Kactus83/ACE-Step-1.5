/**
 * @module job-filter
 * @remarks Pure client-side queue search, model filtering and chronological ordering.
 * @public
 */
import { StudioJob } from "../../core/api.types";

/** @public Supported queue filters. */
export type JobFilter = "all" | "active" | "succeeded" | "failed";

/** @public Stable chronological choices for local task history. */
export type JobSort = "newest" | "oldest";

/**
 * @public Explicit model names used by the jobs in this client session.
 * @remarks Unknown/default models stay unclassified rather than being inferred.
 */
export function availableJobModels(jobs: readonly StudioJob[]): readonly string[] {
  return [...new Set(jobs.map(job => job.request?.model?.trim() || "")
    .filter(name => name.length > 0))].sort((a, b) => a.localeCompare(b));
}

/**
 * @public Filter and order session jobs without changing backend state or persistence.
 * @remarks An empty model filter includes tasks whose model was never reported.
 */
export function filterJobs(
  jobs: readonly StudioJob[], status: JobFilter, search: string,
  model = "", sort: JobSort = "newest"
): readonly StudioJob[] {
  const query = search.trim().toLocaleLowerCase();
  const matched = jobs.filter(job => {
    const matchesStatus = status === "all"
      || status === "active" && ["queued", "running", "unknown"].includes(job.phase)
      || status === job.phase;
    const matchesModel = !model || job.request?.model === model;
    const matchesQuery = !query || job.title.toLocaleLowerCase().includes(query)
      || job.id.toLocaleLowerCase().includes(query)
      || job.results.some(result => result.prompt?.toLocaleLowerCase().includes(query));
    return matchesStatus && matchesModel && matchesQuery;
  });
  return [...matched].sort((a, b) => {
    const aTime = Number.isFinite(a.createdAt) ? a.createdAt : 0;
    const bTime = Number.isFinite(b.createdAt) ? b.createdAt : 0;
    return sort === "newest" ? bTime - aTime : aTime - bTime;
  });
}
