/**
 * @module analysis-result-test
 * @remarks Preserve code/metadata from specialized Python queue response items.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { decodeAnalysisResult } from "../../src/app/features/analysis/analysis-result";

describe("non-audio task results", () => {
  it("preserves extracted audio codes for deliberate export, not media playback", () => {
    const item = { status_message: "Audio Codes Extraction Success",
      audio_codes: "<|audio|>ABC123", audio_paths: [] };
    const result = decodeAnalysisResult({
      task_id: "a", status: 1, result: JSON.stringify([item])
    });
    expect(result?.kind).toBe("codes");
    expect(result?.audioCodes).toContain("ABC123");
  });

  it("extracts deep analysis metadata from known Python shape", () => {
    const result = decodeAnalysisResult({
      task_id: "b", status: 1, result: JSON.stringify([{
        status_message: "Full Hardware Analysis Success",
        bpm: 93, prompt: "Staccato strings", language: "en",
        audio_codes: "some-codes", metas: { keyscale: "A minor" }
      }])
    });
    expect(result?.kind).toBe("deep");
    expect(result?.fields).toContainEqual({ label: "bpm", value: "93" });
    expect(result?.fields).toContainEqual({ label: "keyscale", value: "A minor" });
    expect(result?.prompt).toBe("Staccato strings");
  });

  it("handles normal metadata-only responses without inventing audio", () => {
    const result = decodeAnalysisResult({
      task_id: "c", status: 1, result: JSON.stringify([{
        file: "", prompt: "Wide synths", metas: { bpm: 120 }
      }])
    }, { task_type: "text2music", prompt: "Wide synths", lyrics: "",
      thinking: false, analysis_only: true });
    expect(result?.kind).toBe("metadata");
    expect(result?.fields[0]?.label).toBe("bpm");
    expect(result?.audioCodes).toBeNull();
  });

  it("does not mislabel regular generation or running tasks as analysis", () => {
    expect(decodeAnalysisResult({
      task_id: "d", status: 0, result: "[]"
    })).toBeNull();
    expect(decodeAnalysisResult({
      task_id: "e", status: 1, result: '[{"file":"/v1/audio?path=x"}]'
    })).toBeNull();
  });
});

