/**
 * @module locale-store-test
 * @remarks Locale selection is strongly typed, with safe English fallback.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { decodeLocale } from "../../src/app/core/locale.store";

describe("interface locale selection", () => {
  it("accepts French or English and rejects arbitrary stored values", () => {
    expect(decodeLocale("fr")).toBe("fr");
    expect(decodeLocale("en")).toBe("en");
    expect(decodeLocale("es")).toBe("en");
    expect(decodeLocale(null)).toBe("en");
  });
});

