/**
 * @module locale-create-tests
 * @remarks Stable English and French safety copy for creative generation.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { translateLocale } from "../../src/app/core/locale.store";

describe("Create and expert bilingual contracts", () => {
  it("preserves existing English labels used by browser tests", () => {
    expect(translateLocale("create.description", "en")).toBe("Music description");
    expect(translateLocale("create.generate", "en")).toBe("Generate music");
    expect(translateLocale("create.variations", "en")).toBe("Variations");
  });
  it("translates high-risk DCW and 5Hz LM warnings without changing technical field names", () => {
    expect(translateLocale("create.errorDcw", "fr")).toContain("déformer");
    expect(translateLocale("create.errorSample", "fr")).toContain("mémoire GPU");
    expect(translateLocale("expert.dcwHint", "fr")).toContain("non-turbo");
    expect(translateLocale("expert.dcwAuto", "en")).toContain("Backend model");
  });
  it("keeps local storage and audio-safety notices complete in French", () => {
    expect(translateLocale("preset.storageNotice", "fr")).toContain("jetons API");
    expect(translateLocale("create.restoreMedia", "fr")).toContain("audio source");
    expect(translateLocale("source.crossfadeHint", "fr")).toContain("25 Hz");
  });
});

