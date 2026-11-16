/**
 * @module locale-workspaces-tests
 * @remarks Exact EN/FR core workspace labels remain typed and deterministic.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { translateLocale } from "../../src/app/core/locale.store";

describe("feature-based bilingual catalogs", () => {
  it("translates queue lifecycle with identical stable English copy", () => {
    expect(translateLocale("jobs.title", "en")).toBe("Queue & results.");
    expect(translateLocale("jobs.title", "fr")).toBe("File et résultats.");
    expect(translateLocale("jobs.phase.succeeded", "en")).toBe("succeeded");
    expect(translateLocale("jobs.phase.succeeded", "fr")).toBe("terminée");
  });

  it("retains complete local-data warnings across both languages", () => {
    expect(translateLocale("library.backupNotice", "en")).toContain("not the audio files");
    expect(translateLocale("library.backupNotice", "fr")).toContain("pas les fichiers audio");
    expect(translateLocale("library.resetConfirm", "fr")).toContain("suppression");
  });

  it("distinguishes accessible navigation controls and visible variant text", () => {
    expect(translateLocale("batch.next", "en")).toBe("Next →");
    expect(translateLocale("batch.nextAria", "en")).toBe("Next variant");
    expect(translateLocale("batch.nextAria", "fr")).toBe("Variante suivante");
  });

  it("does not translate backend-owned model names or user content", () => {
    expect(translateLocale("compare.notReported", "fr")).toBe("non communiquée");
    expect(translateLocale("nav.system", "fr")).toBe("Connexion");
  });
});

