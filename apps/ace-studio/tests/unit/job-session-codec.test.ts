/**
 * @module job-session-codec-tests
 * @remarks Never resume a stale job from a different Python backend origin.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { decodeSessionJobs, encodeSessionJobs } from "../../src/app/core/job-session-codec";
import { StudioJob } from "../../src/app/core/api.types";

const origin = "http://127.0.0.1:8001";
const jobs: StudioJob[] = [{
  id: "mock-job-01", title: "Sound experiment", createdAt: 12345,
  phase: "succeeded", progressText: "Done", results: [],
  request: { task_type: "text2music", prompt: "PRIVATE PROMPT",
    lyrics: "[inst]", thinking: false },
  analysisMode: "codes"
}];

describe("scoped job session cache", () => {
  it("serializes only safe task metadata and never prompts, credentials or source files", () => {
    const encoded = encodeSessionJobs(origin, jobs);
    const text = JSON.stringify(encoded);
    expect(encoded.version).toBe(2);
    expect(text).not.toContain("PRIVATE PROMPT");
    expect(text).not.toContain("request");
    expect(decodeSessionJobs(encoded, origin)[0]?.analysisMode).toBe("codes");
  });

  it("refuses old, malformed or foreign-origin caches without querying old task IDs", () => {
    const encoded = encodeSessionJobs(origin, jobs);
    expect(decodeSessionJobs(encoded, "http://localhost:8001")).toEqual([]);
    expect(decodeSessionJobs(jobs, origin)).toEqual([]);
    expect(decodeSessionJobs({ version: 1, jobs }, origin)).toEqual([]);
    expect(decodeSessionJobs({ version: 2, endpoint: origin, jobs: [
      { id: "bad\nname", title: "x", createdAt: 1 },
      { id: "good", title: "okay", createdAt: 2 },
      { id: "good", title: "duplicate", createdAt: 2 }
    ] }, origin)).toEqual([{ id: "good", title: "okay", createdAt: 2 }]);
  });

  it("keeps no more than thirty known task IDs", () => {
    const many = Array.from({ length: 35 }, (_, i) => ({
      ...jobs[0]!, id: "mock-" + i
    }));
    expect(decodeSessionJobs(encodeSessionJobs(origin, many), origin)).toHaveLength(30);
  });
});

