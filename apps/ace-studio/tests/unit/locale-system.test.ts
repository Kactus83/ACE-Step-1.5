/**
 * @module locale-system-tests
 * @remarks Typed translation of security-sensitive connection and GPU UI copy.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { translateLocale } from "../../src/app/core/locale.store";

describe("connection and model initialization translations", () => {
  it("keeps the original English control text for existing Playwright tests", () => {
    expect(translateLocale("system.url", "en")).toBe("API server address");
    expect(translateLocale("system.connect", "en")).toBe("Save & connect");
    expect(translateLocale("models.reviewBoth", "en"))
      .toBe("Review DiT + LM initialization");
  });

  it("describes GPU resource allocation and model reinitialization in French", () => {
    expect(translateLocale("models.confirmReinit", "fr"))
      .toContain("réinitialisation du DiT");
    expect(translateLocale("models.confirmReinit", "fr")).toContain("GPU");
    expect(translateLocale("system.tokenHelp", "fr")).toContain("uniquement en mémoire");
  });

  it("does not silently mark server resources ready before reporting", () => {
    expect(translateLocale("system.notReady", "fr")).toBe("Non indiqué comme prêt");
    expect(translateLocale("system.notInitialized", "fr")).toBe("Non initialisé");
  });
});

