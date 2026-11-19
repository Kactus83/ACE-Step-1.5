/**
 * @module batch-navigation
 * @remarks Pure, bounded navigation of completed variants without remote side effects.
 * @public
 */
import { GeneratedAudio, StudioJob } from "../../core/api.types";

/** @public Client display mode: all playable variants or one selected variant. */
export type VariantSelection = number | "all";

/** @public The nonempty, playable result indices reported by the server. */
export function playableVariantIndices(results: readonly GeneratedAudio[]): readonly number[] {
  return results.reduce<number[]>((out, item, index) => {
    if (typeof item.file === "string" && item.file.length > 0) out.push(index);
    return out;
  }, []);
}

/**
 * @public Clamp stale selections to the available server variants.
 * @remarks Indexes are zero-based; "all" means do not collapse the batch.
 */
export function normalizeVariantSelection(
  selection: VariantSelection,
  results: readonly GeneratedAudio[]
): VariantSelection {
  const indices = playableVariantIndices(results);
  if (selection === "all" || !indices.length) return "all";
  return indices.includes(selection) ? selection : indices[0]!;
}

/**
 * @public Step through the actual playable variants (skipping metadata-only entries).
 * @remarks Navigation wraps at either edge and never modifies backend tasks.
 */
export function stepVariant(
  selection: VariantSelection, results: readonly GeneratedAudio[], delta: -1 | 1
): VariantSelection {
  const indices = playableVariantIndices(results);
  if (!indices.length) return "all";
  const current = selection === "all" ? (delta === 1 ? -1 : 0)
    : indices.indexOf(selection);
  const next = (current + delta + indices.length) % indices.length;
  return indices[next]!;
}

/** @public Stable local day buckets for human navigation, without server grouping claims. */
export interface DayGroup {
  readonly key: string;
  readonly label: string;
  readonly count: number;
  readonly jobs: readonly StudioJob[];
}

/**
 * @public Group visible session jobs by calendar day in the caller's local timezone.
 * @remarks Recovered jobs retain their saved client creation timestamp.
 */
export function groupJobsByDay(jobs: readonly StudioJob[]): readonly DayGroup[] {
  const order: string[] = [];
  const groups = new Map<string, StudioJob[]>();
  for (const job of jobs) {
    const date = Number.isFinite(job.createdAt) ? new Date(job.createdAt) : new Date(0);
    const key = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")].join("-");
    if (!groups.has(key)) { groups.set(key, []); order.push(key); }
    groups.get(key)!.push(job);
  }
  return order.map(key => {
    const values = groups.get(key)!;
    return { key, label: key, count: values.length, jobs: values };
  });
}

