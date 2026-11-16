/**
 * @module keyboard-shortcuts-tests
 * @remarks Keyboard navigation never intercepts typing or system modifiers.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { resolveStudioShortcut } from "../../src/app/core/keyboard-shortcuts";

const alt = { altKey: true, ctrlKey: false, metaKey: false, shiftKey: false };

describe("studio keyboard navigation", () => {
  it("maps seven Alt+digit combinations without relying on keyboard layout", () => {
    const sections = ["create", "jobs", "library", "datasets", "training", "system", "analysis"];
    for (let i = 1; i <= 7; i++) {
      expect(resolveStudioShortcut({ ...alt, code: "Digit" + i })).toBe(sections[i - 1]);
    }
  });
  it("does not steal form edits or AltGr/key modifier combinations", () => {
    expect(resolveStudioShortcut({ ...alt, code: "Digit1" }, true)).toBeNull();
    expect(resolveStudioShortcut({ ...alt, ctrlKey: true, code: "Digit1" })).toBeNull();
    expect(resolveStudioShortcut({ ...alt, metaKey: true, code: "Digit1" })).toBeNull();
    expect(resolveStudioShortcut({ ...alt, code: "Digit9" })).toBeNull();
    expect(resolveStudioShortcut({ ...alt, shiftKey: true, code: "Digit1" })).toBeNull();
  });
});


