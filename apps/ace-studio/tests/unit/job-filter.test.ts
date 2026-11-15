/**
 * @module job-filter-tests
 * @remarks Precise queue search/filter semantics; no backend operation.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { filterJobs } from "../../src/app/features/results/job-filter";
import { StudioJob } from "../../src/app/core/api.types";

const jobs: readonly StudioJob[] = [
  { id: "t-1", title: "Granular Ambient", phase: "succeeded",
    createdAt: 1, progressText: "", results: [{ file: "/audio", prompt: "Blue drones" }] },
  { id: "t-2", title: "Dark Beats", phase: "running",
    createdAt: 2, progressText: "", results: [] },
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
});

