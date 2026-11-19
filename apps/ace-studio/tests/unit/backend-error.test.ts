/**
 * @module backend-error-tests
 * @remarks Status-aware retry classifications without leaking arbitrary errors.
 * @internal
 */
import { describe, expect, it } from "vitest";
import {
  classifyBackendFailure, safeBackendMessage, safeSubmissionFailureMessage
} from "../../src/app/core/backend-error";

describe("backend failure policies", () => {
  it("stops all automatic retries on invalid or forbidden credentials", () => {
    expect(classifyBackendFailure({ status: 401 }).retryable).toBe(false);
    expect(classifyBackendFailure({ status: 403 }).kind).toBe("authorization");
    expect(classifyBackendFailure({ status: 401 }).message).toContain("Connection");
  });
  it("delays transient failures without treating 404/409 as a network outage", () => {
    expect(classifyBackendFailure({ status: 0 }).retryable).toBe(true);
    expect(classifyBackendFailure({ status: 429 }).retryable).toBe(true);
    expect(classifyBackendFailure({ status: 503 }).retryable).toBe(true);
    expect(classifyBackendFailure({ status: 404 }).retryable).toBe(false);
    expect(classifyBackendFailure({ status: 409 }).retryable).toBe(false);
  });
  it("does not echo an untrusted HTTP error body or token-bearing URL", () => {
    const error = { status: 401, message: "Bearer SUPER_SECRET at /private" };
    expect(safeBackendMessage(error)).not.toContain("SUPER_SECRET");
    expect(safeBackendMessage(error)).toContain("401");
  });
  it("warns on ambiguous task acceptance without suggesting duplicate submissions", () => {
    const notice = "Do not resubmit without checking the job.";
    for (const failure of [{ status: 0 }, { status: 503 }, new Error("Unknown response")]) {
      expect(safeSubmissionFailureMessage(failure, notice)).toContain(notice);
    }
    for (const failure of [{ status: 400 }, { status: 401 }, { status: 429 }]) {
      expect(safeSubmissionFailureMessage(failure, notice)).not.toContain(notice);
    }
  });
  it("preserves bounded local validation errors", () => {
    expect(safeBackendMessage(new Error("Invalid repaint range.")))
      .toBe("Invalid repaint range.");
  });
});

