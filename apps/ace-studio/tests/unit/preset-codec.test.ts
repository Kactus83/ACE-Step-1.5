/** @module preset-codec-tests @remarks Security and backwards-compatibility coverage. */
import { describe, expect, it } from "vitest";
import { decodePresets, sanitizeFields } from "../../src/app/core/preset-codec";

describe("local preset boundaries", () => {
  it("keeps typed generation settings but excludes tokens and arbitrary keys", () => {
    const result = sanitizeFields({
      prompt: "Warm analogue atmosphere", duration: 120, thinking: true,
      apiKey: "never persist me", __proto__: "ignored", extra: { dangerous: true }
    });
    expect(result).toEqual({
      prompt: "Warm analogue atmosphere", duration: 120, thinking: true
    });
    expect(Object.prototype.hasOwnProperty.call(result, "apiKey")).toBe(false);
  });

  it("rejects invalid payload and unknown schema version", () => {
    expect(decodePresets("not a structure")).toEqual([]);
    expect(decodePresets({ version: 2, items: [] })).toEqual([]);
    expect(decodePresets({ version: 1, items: [{ name: "bad" }] })).toEqual([]);
  });

  it("can roundtrip a valid preset with bounded fields", () => {
    const snapshot = { version: 1, items: [{
      id: "one", name: "Space organ", updatedAt: 1234,
      fields: { prompt: "cosmic organ", bpm: 108, use_random_seed: true }
    }] };
    expect(decodePresets(snapshot)).toEqual(snapshot.items);
  });
});
