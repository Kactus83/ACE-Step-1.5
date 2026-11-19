/**
 * @module locale-result-details-tests
 * @remarks Result UI controls are bilingual without rewriting backend data.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { translateLocale } from "../../src/app/core/locale.store";

describe("audio, metadata and analysis detail localization", () => {
  it("preserves the existing English actions", () => {
    expect(translateLocale("audio.load", "en")).toBe("Load audio preview");
    expect(translateLocale("audio.remix", "en")).toBe("Remix");
    expect(translateLocale("metadata.details", "en")).toBe("View generation details");
    expect(translateLocale("analysisResult.download", "en"))
      .toBe("Download audio codes as TXT");
  });
  it("translates French metadata and accessible playback controls", () => {
    expect(translateLocale("audio.previewAria", "fr")).toBe("Aperçu audio");
    expect(translateLocale("metadata.details", "fr"))
      .toBe("Afficher les détails de génération");
    expect(translateLocale("analysisResult.reuseCodes", "fr")).toContain("Réutiliser");
    expect(translateLocale("analysisResult.limit", "fr")).toContain("1 000 000");
  });
  it("maintains explicit warnings about backend-reported estimates", () => {
    expect(translateLocale("analysisResult.disclaimer", "en"))
      .toContain("server-reported");
    expect(translateLocale("analysisResult.disclaimer", "fr")).toContain("serveur");
  });
});
