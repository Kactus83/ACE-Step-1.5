/**
 * @module analysis-request-test
 * @remarks Correct flags and preconditions for ACE-Step analysis-only tasks.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { mapAnalysisRequest } from "../../src/app/features/analysis/analysis.request";

describe("backend analysis request contract", () => {
  const defaults = { mode: "codes" as const, model: "acestep-v15-base",
    prompt: "", lyrics: "" };

  it("extracts source codes without LM and without generating new audio", () => {
    const request = mapAnalysisRequest(defaults, true, false);
    expect(request.extract_codes_only).toBe(true);
    expect(request.full_analysis_only).toBe(false);
    expect(request.analysis_only).toBe(false);
    expect(request.task_type).toBe("text2music");
  });

  it("requires explicit LM readiness for deep audio analysis", () => {
    expect(() => mapAnalysisRequest({ ...defaults, mode: "deep" },
      true, false)).toThrow("Initialize");
    expect(mapAnalysisRequest({ ...defaults, mode: "deep" },
      true, true).full_analysis_only).toBe(true);
  });

  it("allows text metadata analysis with no audio upload", () => {
    const request = mapAnalysisRequest({
      ...defaults, mode: "metadata", prompt: "Rhythmic noise", lyrics: "[inst]"
    }, false, true);
    expect(request.analysis_only).toBe(true);
    expect(request.prompt).toBe("Rhythmic noise");
    expect(request.lyrics).toBe("[inst]");
  });

  it("rejects absent source or description and unsupported LM states", () => {
    expect(() => mapAnalysisRequest(defaults, false, false)).toThrow("source audio");
    expect(() => mapAnalysisRequest({ ...defaults, mode: "metadata", prompt: "" },
      false, true)).toThrow("description");
    expect(() => mapAnalysisRequest({ ...defaults, mode: "metadata", prompt: "Piano" },
      false, false)).toThrow("Initialize");
  });
});

