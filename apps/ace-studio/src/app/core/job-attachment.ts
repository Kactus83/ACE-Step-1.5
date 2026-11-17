/**
 * @module job-attachment
 * @remarks Read-only task identity verification at the standalone API boundary.
 * @public
 */
import { isObject } from "./api-decoder";

/** @public Existing task identity and phase, authoritative from the Python store. */
export interface ExistingJobLookup {
  readonly task_id: string;
  readonly status: "queued" | "running" | "succeeded" | "failed";
}

const JOB_ID = /^[A-Za-z0-9_.:-]{1,160}$/;
const STATUSES = new Set(["queued", "running", "succeeded", "failed"]);

/**
 * @public Validate an opaque user-supplied task identifier before network lookup.
 * @returns The trimmed identifier, or null for unsafe/invalid input.
 */
export function parseExistingJobId(input: string): string | null {
  const id = input.trim();
  return JOB_ID.test(id) ? id : null;
}

/**
 * @public Decode and bind a backend lookup to the exact requested task ID.
 * @throws Error when the response is malformed, mismatched or unknown-status.
 */
export function decodeExistingJobLookup(
  payload: unknown, expectedId: string
): ExistingJobLookup {
  if (!isObject(payload) || payload["task_id"] !== expectedId
    || typeof payload["status"] !== "string" || !STATUSES.has(payload["status"])) {
    throw new Error("Invalid existing-task lookup response.");
  }
  return {
    task_id: expectedId,
    status: payload["status"] as ExistingJobLookup["status"]
  };
}
