/**
 * @module comparison-options
 * @remarks Pure catalog/queue selection for server-safe A/B audio comparisons.
 * @public
 */
import { normalizeAudioUrl } from "../../core/api-decoder";
import { StudioJob } from "../../core/api.types";
import { LibraryProject } from "../library/library.types";

/** @public One playable variant available from the current backend. */
export interface ComparisonOption {
  readonly id: string;
  readonly label: string;
  readonly file: string;
  readonly seed: string | null;
  readonly source: "session" | "library";
}

/**
 * @public Build safe A/B options from completed jobs and explicit local bookmarks.
 * @remarks References on other server origins or arbitrary routes are filtered.
 */
export function comparisonOptions(
  jobs: readonly StudioJob[], projects: readonly LibraryProject[], endpoint: string
): readonly ComparisonOption[] {
  const results: ComparisonOption[] = [];
  const seen = new Set<string>();
  const add = (id: string, label: string, file: string, seed: string | undefined,
    source: ComparisonOption["source"]): void => {
    if (!file || seen.has(id)) return;
    try { normalizeAudioUrl(file, endpoint); } catch { return; }
    seen.add(id);
    results.push({ id, label: label.slice(0, 145), file, seed: seed || null, source });
  };
  for (const job of jobs) {
    if (job.phase !== "succeeded") continue;
    job.results.forEach((result, index) => add(
      "job:" + job.id + ":" + index,
      job.title + " · Variant " + (index + 1), result.file,
      result.seed_value, "session"
    ));
  }
  for (const project of projects) {
    for (const track of project.tracks) {
      if (track.backend !== endpoint) continue;
      add("library:" + project.id + ":" + track.id,
        project.name + " / " + track.title + " · Variant " + track.variant,
        track.result.file, track.result.seed_value, "library");
    }
  }
  return results.slice(0, 240);
}

