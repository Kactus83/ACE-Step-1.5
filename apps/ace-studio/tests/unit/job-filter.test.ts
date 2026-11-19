/**
 * @module job-filter-tests
 * @remarks Precise queue search/filter semantics; no backend operation.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { availableJobModels, filterJobs } from "../../src/app/features/results/job-filter";
import { StudioJob } from "../../src/app/core/api.types";

const jobs: readonly StudioJob[] = [
  { id: "t-1", title: "Granular Ambient", phase: "succeeded",
    createdAt: 1, progressText: "", results: [{ file: "/audio", prompt: "Blue drones" }],
    request: { prompt: "Blue drones", lyrics: "", thinking: false,
      task_type: "text2music", model: "acestep-v15-turbo" } },
  { id: "t-2", title: "Dark Beats", phase: "running",
    createdAt: 2, progressText: "", results: [],
    request: { prompt: "Dark beats", lyrics: "", thinking: false,
      task_type: "text2music", model: "acestep-v15-base" } },
  { id: "t-3", title: "High Energy", phase: "failed",
    createdAt: 3, progressText: "", results: [] }
];

describe("queue filtering", () => {
  it("filters case-insensitive titles, server prompts and task ids", () => {
    expect(filterJobs(jobs, "all", "aMbIeNt")).toHaveLength(1);
    expect(filterJobs(jobs, "all", "BLUE")).toHaveLength(1);
    expect(filterJobs(jobs, "all", "t-3")).toHaveLength(1);
  });
  it("shows active jobs without falsely treating completed jobs as active", () => {
    expect(filterJobs(jobs, "active", "")).toEqual([jobs[1]]);
    expect(filterJobs(jobs, "failed", "")).toEqual([jobs[2]]);
  });
  it("filters by explicitly chosen models but preserves unknown models in all", () => {
    expect(availableJobModels(jobs)).toEqual(["acestep-v15-base", "acestep-v15-turbo"]);
    expect(filterJobs(jobs, "all", "", "acestep-v15-turbo")).toEqual([jobs[0]]);
    expect(filterJobs(jobs, "all", "", "acestep-v15-base")).toEqual([jobs[1]]);
    expect(filterJobs(jobs, "all", "")).toHaveLength(3);
  });
  it("sorts by recorded client time without mutating the original jobs", () => {
    expect(filterJobs(jobs, "all", "", "", "newest").map(job => job.id))
      .toEqual(["t-3", "t-2", "t-1"]);
    expect(filterJobs(jobs, "all", "", "", "oldest").map(job => job.id))
      .toEqual(["t-1", "t-2", "t-3"]);
    expect(jobs.map(job => job.id)).toEqual(["t-1", "t-2", "t-3"]);
  });
});

