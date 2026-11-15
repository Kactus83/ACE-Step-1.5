/**
 * @module job-filter
 * @remarks Pure client-side queue search and status filtering.
 * @public
 */
import { StudioJob } from "../../core/api.types";

/** @public Supported queue filters. */
export type JobFilter = "all" | "active" | "succeeded" | "failed";

/**
 * @public Filter session jobs without changing backend task state or persistence.
 */
export function filterJobs(
  jobs: readonly StudioJob[], status: JobFilter, search: string
): readonly StudioJob[] {
  const query = search.trim().toLocaleLowerCase();
  return jobs.filter(job => {
    const matchesStatus = status === "all"
      || status === "active" && ["queued", "running", "unknown"].includes(job.phase)
      || status === job.phase;
    const matchesQuery = !query || job.title.toLocaleLowerCase().includes(query)
      || job.id.toLocaleLowerCase().includes(query)
      || job.results.some(result => result.prompt?.toLocaleLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });
}

