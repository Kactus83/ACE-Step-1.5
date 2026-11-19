/**
 * @module model-policy
 * @remarks Use backend-advertised and loaded DiT capabilities before queuing GPU work.
 * @public
 */
import { ModelInventory, TaskType } from "../../core/api.types";

/** @public Ordered ACE-Step creation modes known to the Studio form. */
export const STUDIO_TASK_MODES: readonly TaskType[] = [
  "text2music", "cover", "repaint", "extract", "lego", "complete"
];

/** @public Reasons a client should not submit against the currently selected DiT. */
export type GenerationModelIssue =
  "unavailable" | "unknown" | "not-loaded" | "unsupported";

/**
 * @internal Resolve the model explicitly chosen or advertised as server default.
 * @remarks No guessing from the first inventory entry or from model name suffixes.
 * @param inventory Current server inventory, or null while disconnected.
 * @param requestedName Explicit form selection; empty means server default.
 * @returns The matching inventory model, or undefined for an unknown selection.
 */
function resolveModel(inventory: ModelInventory | null, requestedName: string) {
  const name = requestedName || inventory?.default_model || "";
  return inventory?.models.find(model => model.name === name);
}

/**
 * @public Enumerate only task modes actually advertised for the selected model.
 * @remarks Not-loaded models still show their capabilities, but cannot be submitted.
 * @param inventory Authoritative model inventory from the current API connection.
 * @param requestedName Explicit model selection, or empty for server default.
 * @returns Supported Studio task modes in UI order, never invented defaults.
 */
export function advertisedTaskModes(
  inventory: ModelInventory | null, requestedName: string
): readonly TaskType[] {
  const declared = resolveModel(inventory, requestedName)?.supported_task_types;
  if (!declared) return [];
  return STUDIO_TASK_MODES.filter(mode => declared.includes(mode));
}

/**
 * @public Refuse a silent model fallback or an unsupported task before GPU submission.
 * @remarks Current inventory can become stale; backend must still enforce routing.
 * @param inventory Current backend inventory.
 * @param requestedName Explicit selection or empty server-default placeholder.
 * @param mode Desired generation mode.
 * @returns Null for an advertised loaded compatible model, otherwise a refusal reason.
 */
export function generationModelIssue(
  inventory: ModelInventory | null, requestedName: string, mode: TaskType
): GenerationModelIssue | null {
  if (!inventory || !(requestedName || inventory.default_model)) return "unavailable";
  const model = resolveModel(inventory, requestedName);
  if (!model) return "unknown";
  if (model.is_loaded !== true) return "not-loaded";
  if (!advertisedTaskModes(inventory, requestedName).includes(mode)) return "unsupported";
  return null;
}
