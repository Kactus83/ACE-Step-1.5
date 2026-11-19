/**
 * @module analysis-result
 * @remarks Lossless-safe presentation of queued ACE-Step non-audio analysis.
 * @public
 */
import { AnalysisResult, AnalysisResultMode, AnalysisScalar, GenerateRequest, TaskRecordDto } from "./api.types";
import { isObject } from "./api-decoder";

const directFields = [
  "bpm", "keyscale", "timesignature", "duration", "genre",
  "language", "lm_model", "dit_model"
] as const;

function safeText(value: unknown, limit: number): string {
  return typeof value === "string" ? value.slice(0, limit) : "";
}

function scalar(value: unknown): string | null {
  if (typeof value === "string") return value.slice(0, 500);
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return String(value);
  return null;
}

/**
 * @public Decode analysis responses preserving only approved scalar metadata.
 * @param task - A completed /query_result record.
 * @param request - The original request when still held in the session.
 * @returns Structured analysis or null for ordinary/unfinished audio results.
 */
export function decodeAnalysisResult(
  task: TaskRecordDto, request?: GenerateRequest, expectedKind?: AnalysisResultMode
): AnalysisResult | null {
  if (task.status !== 1) return null;
  let items: unknown = task.result;
  if (typeof items === "string") {
    try { items = JSON.parse(items) as unknown; }
    catch { return null; }
  }
  if (!Array.isArray(items) || !isObject(items[0])) return null;
  const item = items[0];
  const status = safeText(item["status_message"], 160);
  const kind: AnalysisResultMode | null = status === "Audio Codes Extraction Success"
    ? "codes" : status === "Full Hardware Analysis Success"
      ? "deep" : (request?.analysis_only === true || expectedKind === "metadata") && item["file"] === ""
        ? "metadata" : null;
  if (!kind) return null;
  const values: AnalysisScalar[] = [];
  const seen = new Set<string>();
  const add = (name: string, value: unknown): void => {
    const text = scalar(value);
    if (text === null || seen.has(name)) return;
    seen.add(name);
    values.push({ label: name, value: text });
  };
  for (const name of directFields) add(name, item[name]);
  if (isObject(item["metas"])) {
    for (const [name, value] of Object.entries(item["metas"]).slice(0, 48)) {
      if (/^[a-zA-Z][a-zA-Z0-9_-]{0,79}$/.test(name)) add(name, value);
    }
  }
  const codes = kind === "metadata" ? null : safeText(item["audio_codes"], 3_000_000);
  return {
    kind, status: status || "Analysis complete",
    prompt: safeText(item["prompt"], 5000),
    lyrics: safeText(item["lyrics"], 10000),
    audioCodes: codes || null,
    fields: values
  };
}
