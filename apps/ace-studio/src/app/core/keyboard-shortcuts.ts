/**
 * @module keyboard-shortcuts
 * @remarks Conservative, layout-independent navigation commands for Web/Tauri.
 * @public
 */

/** @public Studio sections with a keyboard navigation destination. */
export type StudioSection =
  "create" | "jobs" | "library" | "datasets" | "training" | "system" | "analysis";

const sections: readonly StudioSection[] = [
  "create", "jobs", "library", "datasets", "training", "system", "analysis"
];

/**
 * @public Resolve Alt+digit only, excluding text fields and AltGr/other modifiers.
 * @returns Destination or null when browser behavior should remain untouched.
 */
export function resolveStudioShortcut(
  key: Pick<KeyboardEvent, "altKey" | "ctrlKey" | "metaKey" | "shiftKey" | "code">,
  editing = false
): StudioSection | null {
  if (editing || !key.altKey || key.ctrlKey || key.metaKey || key.shiftKey) return null;
  const match = /^Digit([1-7])$/.exec(key.code);
  return match ? sections[Number(match[1]) - 1] || null : null;
}

/** @public Detect focusable editing targets before applying global shortcuts. */
export function isEditingElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}


