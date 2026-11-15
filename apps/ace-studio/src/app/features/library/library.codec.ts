/**
 * @module library-codec
 * @remarks Defensive import/storage validation: no secrets, arbitrary URLs or binary audio.
 * @public
 */
import { normalizeAudioUrl, normalizeEndpoint, isObject } from "../../core/api-decoder";
import { GeneratedAudio } from "../../core/api.types";
import { LibraryExport, LibraryProject, LibraryTrack } from "./library.types";

/** @public Current persistent catalog format. */
export const LIBRARY_VERSION = 1;
/** @public Bound projects to prevent oversized localStorage snapshots. */
export const MAX_PROJECTS = 30;
/** @public Bound stored references; the browser never persists audio bytes. */
export const MAX_TRACKS = 240;
/** @public Maximum bytes of a portable JSON document accepted for import. */
export const MAX_IMPORT_BYTES = 1_500_000;

const validId = (value: unknown): value is string =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
const finiteDate = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.min(value, 8_640_000_000_000_000) : Date.now();
const bounded = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/**
 * @public Sanitize freeform project tags, excluding HTML and overflowing values.
 * @remarks Angular rendering escapes text, but caps are still useful for portability.
 */
export function normalizeTags(value: unknown): readonly string[] {
  const input = typeof value === "string" ? value.split(",") : value;
  if (!Array.isArray(input)) return [];
  const tags = input.filter((tag): tag is string => typeof tag === "string")
    .map(tag => tag.trim().replace(/[\u0000-\u001f]/g, "").slice(0, 32))
    .filter(Boolean);
  return [...new Set(tags)].slice(0, 8);
}

function decodeResult(value: unknown, backend: string): GeneratedAudio | null {
  if (!isObject(value) || typeof value["file"] !== "string"
    || value["file"].length > 4096) return null;
  try { normalizeAudioUrl(value["file"], backend); }
  catch { return null; }
  const source = isObject(value["metas"]) ? value["metas"] : {};
  const metas: Record<string, string | number | boolean> = {};
  for (const key of ["bpm", "keyscale", "timesignature", "duration", "language"]) {
    const item = source[key];
    if (typeof item === "string") metas[key] = item.slice(0, 120);
    else if (typeof item === "boolean" ||
      typeof item === "number" && Number.isFinite(item)) metas[key] = item;
  }
  return {
    file: value["file"],
    prompt: bounded(value["prompt"], 5000) || undefined,
    lyrics: bounded(value["lyrics"], 10000) || undefined,
    seed_value: bounded(value["seed_value"], 120) || undefined,
    generation_info: bounded(value["generation_info"], 3000) || undefined,
    status: 1,
    ...(Object.keys(metas).length ? { metas } : {})
  };
}

/** @public Decode an untrusted saved track while preserving backend identity. */
export function decodeLibraryTrack(value: unknown): LibraryTrack | null {
  if (!isObject(value) || !validId(value["id"])) return null;
  let backend: string;
  try { backend = normalizeEndpoint(bounded(value["backend"], 512)); }
  catch { return null; }
  const result = decodeResult(value["result"], backend);
  if (!result) return null;
  const variant = value["variant"];
  if (!Number.isSafeInteger(variant) || (variant as number) < 1
    || (variant as number) > 10000) return null;
  return {
    id: value["id"],
    jobId: bounded(value["jobId"], 120),
    variant: variant as number,
    title: bounded(value["title"], 120) || "Untitled audio",
    savedAt: finiteDate(value["savedAt"]),
    backend,
    result,
    favorite: value["favorite"] === true,
    note: bounded(value["note"], 3000),
    tags: normalizeTags(value["tags"])
  };
}

/** @public Validate a project and reject duplicate or malformed track references. */
export function decodeLibraryProject(value: unknown): LibraryProject | null {
  if (!isObject(value) || !validId(value["id"])
    || typeof value["name"] !== "string"
    || !Array.isArray(value["tracks"])) return null;
  const ids = new Set<string>();
  const tracks: LibraryTrack[] = [];
  for (const raw of value["tracks"].slice(0, MAX_TRACKS)) {
    const track = decodeLibraryTrack(raw);
    if (!track || ids.has(track.id)) continue;
    ids.add(track.id);
    tracks.push(track);
  }
  return {
    id: value["id"],
    name: bounded(value["name"], 100) || "Unnamed project",
    description: bounded(value["description"], 3000),
    createdAt: finiteDate(value["createdAt"]),
    updatedAt: finiteDate(value["updatedAt"]),
    tracks
  };
}

/**
 * @public Decode a versioned local project catalog.
 * @throws Error for unknown versions or invalid root documents.
 */
export function decodeLibraryCatalog(raw: unknown): readonly LibraryProject[] {
  if (!isObject(raw) || raw["version"] !== LIBRARY_VERSION
    || !Array.isArray(raw["projects"])) {
    throw new Error("Unsupported local project catalog format.");
  }
  const ids = new Set<string>();
  const projects: LibraryProject[] = [];
  let count = 0;
  for (const value of raw["projects"].slice(0, MAX_PROJECTS)) {
    const project = decodeLibraryProject(value);
    if (!project || ids.has(project.id)) continue;
    const remaining = MAX_TRACKS - count;
    if (remaining <= 0) break;
    const accepted = { ...project, tracks: project.tracks.slice(0, remaining) };
    ids.add(accepted.id);
    projects.push(accepted);
    count += accepted.tracks.length;
  }
  return projects;
}

/** @public Produce a bounded portable JSON envelope, omitting secrets by construction. */
export function encodeLibraryCatalog(
  projects: readonly LibraryProject[], exportedAt = Date.now()
): LibraryExport {
  return { version: 1, exportedAt, projects };
}

/**
 * @public Parse a user-selected local JSON file with an upper bound.
 * @throws Error for oversized or unsupported project files.
 */
export function importLibraryJson(text: string): readonly LibraryProject[] {
  if (new TextEncoder().encode(text).byteLength > MAX_IMPORT_BYTES) {
    throw new Error("Project archive exceeds the 1.5 MB import limit.");
  }
  let parsed: unknown;
  try { parsed = JSON.parse(text) as unknown; }
  catch { throw new Error("Project archive is not valid JSON."); }
  return decodeLibraryCatalog(parsed);
}

