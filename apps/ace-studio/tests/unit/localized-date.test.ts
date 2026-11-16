/**
 * @module localized-date-tests
 * @remarks Date formatting respects active language with no global locale mutation.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { formatStudioDate } from "../../src/app/core/localized-date";

describe("localized creative timeline dates", () => {
  it("supports English and French from the same timestamp", () => {
    const at = new Date(2026, 10, 16, 10, 30).valueOf();
    const english = formatStudioDate(at, "en");
    const french = formatStudioDate(at, "fr");
    expect(english).toContain("2026");
    expect(french).toContain("2026");
    expect(french).not.toBe(english);
  });
  it("renders invalid values without exceptions", () => {
    expect(formatStudioDate(Number.NaN, "en")).toBe("—");
    expect(formatStudioDate(Infinity, "fr")).toBe("—");
  });
});

