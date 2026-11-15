/**
 * @module training-export-request
 * @remarks High-risk adapter export paths are validated before the destructive backend route.
 * @public
 */

/** @public Existing ACE-Step /v1/training/export request body. */
export interface TrainingExportRequest {
  readonly lora_output_dir: string;
  readonly export_path: string;
}

function normalizedPath(value: string): string {
  const input = value.trim();
  if (!input || /[\u0000-\u001f]/.test(input) || /^([/\\]{2})/.test(input)) {
    throw new Error("A nonempty local backend path is required; UNC shares are unsupported.");
  }
  if (/\$\{|\$\(|%[^%]+%/.test(input)) {
    throw new Error("Environment-variable expressions are not supported.");
  }
  const normalized = input.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
  const parts = normalized.split("/").filter(Boolean).filter(part => part !== ".");
  if (parts.some(part => part === "..")) throw new Error("Parent directory traversal is forbidden.");
  const isDrive = /^[a-z]:/i.test(normalized);
  if (parts.length < (isDrive ? 2 : 1)
    || normalized === "/" || /^[a-z]:\/?$/i.test(normalized)) {
    throw new Error("Choose a specific directory, never a filesystem root.");
  }
  return (normalized.startsWith("/") ? "/" : "") + parts.join("/").toLowerCase();
}

/**
 * @public Require distinct non-overlapping source and export directories.
 * @throws Error when a path could overwrite source adapters or be a filesystem root.
 * @remarks No browser-side check can determine whether a backend directory exists.
 */
export function validateTrainingExport(
  source: string, destination: string
): TrainingExportRequest {
  const a = normalizedPath(source), b = normalizedPath(destination);
  if (a === b || a.startsWith(b + "/") || b.startsWith(a + "/")) {
    throw new Error("Export destination must not overlap the source directory.");
  }
  return { lora_output_dir: source.trim(), export_path: destination.trim() };
}


