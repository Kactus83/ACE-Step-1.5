/**
 * @module library-persistence-test
 * @remarks Stale-tab detection remains a pure, deterministic contract.
 * @internal
 */
import { describe, expect, it } from "vitest";
import {
  assertCatalogSnapshot
} from "../../src/app/features/library/library.persistence";

describe("local catalog snapshot consistency", () => {
  it("allows writes when raw snapshot has not changed", () => {
    expect(() => assertCatalogSnapshot(null, null)).not.toThrow();
    expect(() => assertCatalogSnapshot('{"a":1}', '{"a":1}')).not.toThrow();
  });
  it("refuses silent overwrite when another tab updated or deleted a catalog", () => {
    expect(() => assertCatalogSnapshot("old", "new")).toThrow("another tab");
    expect(() => assertCatalogSnapshot("old", null)).toThrow("another tab");
    expect(() => assertCatalogSnapshot(null, "new")).toThrow("another tab");
  });
});
