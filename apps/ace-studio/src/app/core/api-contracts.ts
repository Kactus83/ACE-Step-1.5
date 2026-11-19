/**
 * @module api-contracts
 * @remarks Validate the separate standalone ACE-Step API at the trust boundary.
 * @public
 */
import { AceModel, BackendStats, ModelInventory, TaskRecordDto } from "./api.types";
import { isObject } from "./api-decoder";

function str(value: unknown, max: number): string | undefined {
  return typeof value === "string" && value.length <= max ? value : undefined;
}
function count(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)
    || value < 0 || !Number.isSafeInteger(value)) {
    throw new Error("Backend returned an invalid job/queue counter.");
  }
  return value;
}

function models(value: unknown, label: string): readonly AceModel[] {
  if (!Array.isArray(value) || value.length > 128) {
    throw new Error("Backend returned an invalid " + label + " list.");
  }
  const names = new Set<string>();
  return value.map((item: unknown) => {
    if (!isObject(item) || !str(item["name"], 200) || !item["name"]) {
      throw new Error("Backend returned an unnamed " + label + " entry.");
    }
    const name = item["name"] as string;
    if (names.has(name)) throw new Error("Duplicate backend model name: " + name);
    names.add(name);
    const tasks = item["supported_task_types"];
    if (tasks !== undefined && (!Array.isArray(tasks) || tasks.length > 32
      || !tasks.every(task => Boolean(str(task, 80))))) {
      throw new Error("Unsupported advertised model capability list.");
    }
    return {
      name,
      is_default: item["is_default"] === true,
      is_loaded: item["is_loaded"] === true,
      supported_task_types: tasks as readonly string[] | undefined
    };
  });
}

/**
 * @public Parse real DiT/LM inventory; reject malformed or excessive entries.
 * @throws Error when server-provided model capabilities are inconsistent.
 */
export function decodeModelInventory(payload: unknown): ModelInventory {
  if (!isObject(payload)) throw new Error("Invalid backend model inventory.");
  const defaultModel = payload["default_model"];
  const loadedLm = payload["loaded_lm_model"];
  if (defaultModel !== null && defaultModel !== undefined
    && !str(defaultModel, 200)) throw new Error("Invalid default model name.");
  if (loadedLm !== null && loadedLm !== undefined
    && !str(loadedLm, 200)) throw new Error("Invalid loaded LM name.");
  return {
    models: models(payload["models"], "DiT model"),
    lm_models: models(payload["lm_models"] ?? [], "5Hz LM"),
    default_model: defaultModel as string | null | undefined,
    loaded_lm_model: loadedLm as string | null | undefined,
    llm_initialized: payload["llm_initialized"] === true
  };
}

/** @public Validate real server queue statistics; no synthetic GPU metrics. */
export function decodeBackendStats(payload: unknown): BackendStats {
  if (!isObject(payload) || !isObject(payload["jobs"])) {
    throw new Error("Invalid backend queue statistics.");
  }
  const stats = payload["jobs"];
  const jobs: Record<string, number> = {};
  for (const key of ["total", "queued", "running", "succeeded", "failed"]) {
    if (stats[key] !== undefined) jobs[key] = count(stats[key]);
  }
  const avg = payload["avg_job_seconds"];
  if (typeof avg !== "number" || !Number.isFinite(avg) || avg < 0) {
    throw new Error("Invalid backend average task duration.");
  }
  return {
    jobs, queue_size: count(payload["queue_size"]),
    queue_maxsize: count(payload["queue_maxsize"]), avg_job_seconds: avg
  };
}

/**
 * @public Restrict task records to explicitly requested IDs and bounded data.
 * @throws Error for malformed, duplicate or excessive task records.
 */
export function decodeTaskRecords(
  payload: unknown, requested: readonly string[]
): readonly TaskRecordDto[] {
  if (!Array.isArray(payload) || payload.length > requested.length) {
    throw new Error("Backend returned an invalid task lookup array.");
  }
  const expected = new Set(requested);
  const seen = new Set<string>();
  return payload.map((record: unknown) => {
    if (!isObject(record)) throw new Error("Malformed task lookup record.");
    const id = str(record["task_id"], 160);
    if (!id || !expected.has(id) || seen.has(id)
      || typeof record["status"] !== "number"
      || !Number.isInteger(record["status"])) {
      throw new Error("Invalid or unexpected task result identifier/status.");
    }
    seen.add(id);
    const result = record["result"] ?? "[]";
    if (typeof result === "string" && result.length > 3_000_000) {
      throw new Error("Excessive task result payload size.");
    }
    return {
      task_id: id, status: record["status"] as number, result,
      progress_text: str(record["progress_text"], 2000) || undefined
    };
  });
}

