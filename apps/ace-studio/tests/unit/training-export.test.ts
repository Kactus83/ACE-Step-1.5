/**
 * @module training-export-tests
 * @remarks Guard dangerous source/destination overlaps for existing backend export.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { validateTrainingExport } from "../../src/app/features/training/training-export.request";

describe("training adapter export safety checks", () => {
  it("maps the existing Pydantic export request without changing field names", () => {
    expect(validateTrainingExport("/models/lora_output", "/models/exports/session-1"))
      .toEqual({ lora_output_dir: "/models/lora_output",
        export_path: "/models/exports/session-1" });
    expect(validateTrainingExport("C:\\models\\lora_output", "C:\\exports"))
      .toEqual({ lora_output_dir: "C:\\models\\lora_output", export_path: "C:\\exports" });
  });
  it("rejects identical and nested output directories", () => {
    expect(() => validateTrainingExport("/models/lora", "/models/lora"))
      .toThrow("overlap");
    expect(() => validateTrainingExport("/models/lora", "/models/lora/out"))
      .toThrow("overlap");
    expect(() => validateTrainingExport("/models/lora", "/models"))
      .toThrow("overlap");
  });
  it("rejects root destinations, traversal and UNC network paths", () => {
    expect(() => validateTrainingExport("/models/lora", "/")).toThrow("root");
    expect(() => validateTrainingExport("/models/lora", "/data/../other")).toThrow("traversal");
    expect(() => validateTrainingExport("/models/lora", "\\\\server\\share\\folder"))
      .toThrow("UNC");
  });
});

