/**
 * @module locale-dataset-tests
 * @remarks Dataset safety, shared-state notices and GPU actions are bilingual.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { translateLocale } from "../../src/app/core/locale.store";

describe("dataset translations", () => {
  it("preserves existing English names used in mock browser workflows", () => {
    expect(translateLocale("dataset.sources.scanReview", "en"))
      .toBe("Review scan / replace");
    expect(translateLocale("dataset.sources.scanConfirm", "en"))
      .toBe("Confirm scan and replace");
    expect(translateLocale("dataset.tasks.labelConfirm", "en"))
      .toBe("Confirm GPU labeling");
  });
  it("informs operators of shared server ownership in both languages", () => {
    expect(translateLocale("dataset.sources.warning", "fr"))
      .toContain("partagé");
    expect(translateLocale("dataset.samples.warning", "fr"))
      .toContain("verrou transactionnel");
  });
  it("keeps known status labels separate from raw backend progress", () => {
    expect(translateLocale("dataset.taskPhase.running", "fr")).toBe("en cours");
    expect(translateLocale("dataset.taskPhase.completed", "en")).toBe("completed");
    expect(translateLocale("dataset.tasks.preprocessNotice", "fr")).toContain("DiT");
  });
});

