/**
 * @module theme-store-test
 * @remarks Theme persistence decoder refuses unexpected or tainted values.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { decodeTheme } from "../../src/app/core/theme.store";

describe("theme selection", () => {
  it("accepts two explicit appearances only", () => {
    expect(decodeTheme("light")).toBe("light");
    expect(decodeTheme("dark")).toBe("dark");
    expect(decodeTheme("high-contrast-secret-value")).toBe("dark");
    expect(decodeTheme(null)).toBe("dark");
  });
});

