/**
 * @module batch-navigation-tests
 * @remarks Pure batch navigation and grouping for queue UI.
 * @internal
 */
import { describe, expect, it } from "vitest";
import {
  groupJobsByDay, normalizeVariantSelection, playableVariantIndices, stepVariant
} from "../../src/app/features/results/batch-navigation";
import { StudioJob } from "../../src/app/core/api.types";

const samples = [
  { file: "/v1/audio?path=a", seed_value: "10" },
  { file: "", prompt: "metadata only" },
  { file: "/v1/audio?path=b", seed_value: "11" }
] as const;

describe("batch variant navigation", () => {
  it("uses real playable indices and excludes analysis-only entries", () => {
    expect(playableVariantIndices(samples)).toEqual([0, 2]);
    expect(normalizeVariantSelection(1, samples)).toBe(0);
  });
  it("wraps forward/backward without losing the index into the original batch", () => {
    expect(stepVariant("all", samples, 1)).toBe(0);
    expect(stepVariant(0, samples, 1)).toBe(2);
    expect(stepVariant(2, samples, 1)).toBe(0);
    expect(stepVariant(0, samples, -1)).toBe(2);
    expect(stepVariant("all", samples, -1)).toBe(2);
  });
  it("reports no fake audio variants for analysis-only outputs", () => {
    expect(stepVariant("all", [{ file: "" }], 1)).toBe("all");
    expect(normalizeVariantSelection(3, [],)).toBe("all");
  });
});

describe("client calendar-day organization", () => {
  it("groups by local date without conflating same titles or task IDs", () => {
    const job = (id: string, date: number): StudioJob => ({
      id, createdAt: date, title: "Same title", phase: "succeeded",
      progressText: "", results: []
    });
    const one = new Date(2026, 10, 16, 12).valueOf();
    const two = new Date(2026, 10, 15, 12).valueOf();
    const groups = groupJobsByDay([job("one", one), job("two", two), job("three", one)]);
    expect(groups).toHaveLength(2);
    expect(groups[0]?.count).toBe(2);
    expect(groups[0]?.jobs.map(item => item.id)).toEqual(["one", "three"]);
    expect(groups[1]?.count).toBe(1);
  });
});

