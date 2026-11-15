/**
 * @module api-decoder
 * @remarks Boundary validation for legacy wrapper and JSON-encoded job results.
 * @public
 */
import {
  ApiEnvelope, GeneratedAudio, JobPhase, TaskRecordDto
} from "./api.types";

/** @internal Guard against malformed or unexpectedly shaped responses. */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * @public Unwrap a backend envelope and reject application-level errors.
 * @throws Error when the response is malformed or indicates an API error.
 */
export function unwrap<T>(payload: unknown): T {
  if (!isObject(payload) || typeof payload["code"] !== "number") {
    throw new Error("Unsupported ACE-Step API response envelope.");
  }
  if (payload["code"] !== 200 || payload["error"]) {
    const description = payload["error"];
    throw new Error(typeof description === "string" && description
      ? description : "ACE-Step returned API code " + payload["code"]);
  }
  return (payload as unknown as ApiEnvelope<T>).data;
}

/**
 * @public Normalize status and decode the list carried by /query_result.
 * @throws Error when the response is corrupt, not when audio is simply absent.
 */
export function decodeTask(raw: unknown): {
  phase: JobPhase; results: readonly GeneratedAudio[]; progressText: string;
} {
  if (!isObject(raw) || typeof raw["status"] !== "number") {
    throw new Error("Malformed task lookup record.");
  }
  const dto = raw as unknown as TaskRecordDto;
  let parsed: unknown = dto.result;
  if (typeof parsed === "string") {
    if (!parsed.trim()) parsed = [];
    else {
      try { parsed = JSON.parse(parsed) as unknown; }
      catch { throw new Error("Malformed JSON in ACE-Step job results."); }
    }
  }
  if (!Array.isArray(parsed)) throw new Error("Expected a job result array.");
  const results: GeneratedAudio[] = parsed.map((item: unknown) => {
    if (!isObject(item)) throw new Error("Malformed audio result item.");
    return {
      file: typeof item["file"] === "string" ? item["file"] : "",
      prompt: typeof item["prompt"] === "string" ? item["prompt"] : undefined,
      lyrics: typeof item["lyrics"] === "string" ? item["lyrics"] : undefined,
      status: typeof item["status"] === "number" ? item["status"] : undefined,
      seed_value: typeof item["seed_value"] === "string" ? item["seed_value"] : undefined,
      generation_info: typeof item["generation_info"] === "string"
        ? item["generation_info"] : undefined,
      metas: isObject(item["metas"]) ? item["metas"] : undefined,
      error: typeof item["error"] === "string" ? item["error"] : undefined,
      stage: typeof item["stage"] === "string" ? item["stage"] : undefined,
      progress: typeof item["progress"] === "number" ? item["progress"] : undefined
    };
  });
  const phase: JobPhase = dto.status === 0
    ? "running" : dto.status === 1 ? "succeeded" : dto.status === 2 ? "failed" : "unknown";
  return { phase, results, progressText: dto.progress_text || "" };
}

/**
 * @public Only trust URLs under the explicitly configured API origin and audio route.
 * @throws Error when the server returns an unsafe or unsupported audio reference.
 */
export function normalizeAudioUrl(raw: string, endpoint: string): string {
  const base = new URL(endpoint);
  const target = new URL(raw, base.origin + "/");
  if (!["http:", "https:"].includes(target.protocol)
      || target.origin !== base.origin
      || target.pathname !== "/v1/audio"
      || !target.searchParams.has("path")) {
    throw new Error("Audio URL rejected: unexpected origin or path.");
  }
  return target.href;
}

/**
 * @public Enforce a user-controlled endpoint to avoid credential leakage.
 * @throws Error for unsupported, embedded-secret or non-local plaintext URLs.
 */
export function normalizeEndpoint(raw: string): string {
  let url: URL;
  try { url = new URL(raw.trim()); }
  catch { throw new Error("Enter a valid backend URL."); }
  const isLoopback = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]";
  if ((url.protocol !== "https:" && !(url.protocol === "http:" && isLoopback))
      || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("Use an HTTPS endpoint or loopback HTTP URL without a path or credentials.");
  }
  return url.origin;
}
