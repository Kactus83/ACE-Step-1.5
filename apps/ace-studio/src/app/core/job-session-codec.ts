/**
 * @module job-session-codec
 * @remarks Versioned, server-scoped session-only job IDs for safe page reloads.
 * @public
 */
import { AnalysisResultMode, StudioJob } from "./api.types";

/** @public Durable shape limited to IDs/labels; excludes audio, credentials and prompts. */
export interface SessionJobsEnvelope {
  readonly version: 2;
  readonly endpoint: string;
  readonly jobs: readonly SessionJobEntry[];
}

/** @public One short-lived persisted task reference, never a remote library. */
export interface SessionJobEntry {
  readonly id: string;
  readonly title: string;
  readonly createdAt: number;
  readonly analysisMode?: AnalysisResultMode;
}

const MODES = new Set(["codes", "deep", "metadata"]);
const ID = /^[a-zA-Z0-9_.:-]{1,160}$/;

/**
 * @public Serialize no more than 30 task IDs for the exact current server origin.
 * @remarks API keys and source files are never written to sessionStorage.
 */
export function encodeSessionJobs(
  endpoint: string, jobs: readonly StudioJob[]
): SessionJobsEnvelope {
  return {
    version: 2, endpoint, jobs: jobs.slice(0, 30).filter(job => ID.test(job.id))
      .map(job => ({
        id: job.id, title: job.title.slice(0, 200),
        createdAt: job.createdAt,
        ...(job.analysisMode ? { analysisMode: job.analysisMode } : {})
      }))
  };
}

/**
 * @public Reject legacy unscoped caches and identifiers from other server origins.
 * @remarks An unknown or invalid payload resolves to no recovered tasks.
 */
export function decodeSessionJobs(
  payload: unknown, endpoint: string
): readonly SessionJobEntry[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
  const data = payload as Record<string, unknown>;
  if (data["version"] !== 2 || data["endpoint"] !== endpoint
    || !Array.isArray(data["jobs"])) return [];
  const seen = new Set<string>();
  const result: SessionJobEntry[] = [];
  for (const item of data["jobs"].slice(0, 30)) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    const id = row["id"], title = row["title"], createdAt = row["createdAt"];
    if (typeof id !== "string" || !ID.test(id) || seen.has(id)
      || typeof title !== "string" || title.length > 200
      || typeof createdAt !== "number" || !Number.isFinite(createdAt)
      || createdAt < 0 || createdAt > 8_640_000_000_000_000) continue;
    seen.add(id);
    result.push({
      id, title, createdAt,
      ...(typeof row["analysisMode"] === "string" && MODES.has(row["analysisMode"])
        ? { analysisMode: row["analysisMode"] as AnalysisResultMode } : {})
    });
  }
  return result;
}

