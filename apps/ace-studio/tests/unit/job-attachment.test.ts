/**
 * @module job-attachment-tests
 * @remarks Verify task IDs and server-declared identity before attaching.
 * @internal
 */
import { describe, expect, it } from "vitest";
import {
  decodeExistingJobLookup, parseExistingJobId
} from "../../src/app/core/job-attachment";

describe("existing-task identity boundary", () => {
  it("accepts known opaque task formats without modifying them", () => {
    expect(parseExistingJobId(" 4e5ab5f4-0000-4000-8000-123456789abc "))
      .toBe("4e5ab5f4-0000-4000-8000-123456789abc");
    expect(parseExistingJobId("mock-job_1.2:qa")).toBe("mock-job_1.2:qa");
    expect(decodeExistingJobLookup({
      task_id: "mock-job_1.2:qa", status: "queued"
    }, "mock-job_1.2:qa")).toEqual({
      task_id: "mock-job_1.2:qa", status: "queued"
    });
  });

  it("rejects injection, empty and overlong identifiers before any request", () => {
    for (const input of ["", " ", "bad/id", "a?b", "a#b", "a b",
      "bad\nname", "a".repeat(161), "../other", "😀"]) {
      expect(parseExistingJobId(input)).toBeNull();
    }
  });

  it("refuses mismatched, incomplete or unknown-phase server responses", () => {
    expect(() => decodeExistingJobLookup({
      task_id: "other", status: "succeeded"
    }, "mine")).toThrow("lookup");
    expect(() => decodeExistingJobLookup({
      task_id: "mine", status: "invented"
    }, "mine")).toThrow("lookup");
    expect(() => decodeExistingJobLookup({
      task_id: "mine"
    }, "mine")).toThrow("lookup");
  });
});
