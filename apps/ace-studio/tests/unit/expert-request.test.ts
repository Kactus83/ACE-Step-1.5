/**
 * @module expert-request-test
 * @remarks Offline tests of model-default DCW preservation and validated expert values.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { ExpertSnapshot, mapExpertRequest, normalizeTimesteps } from "../../src/app/features/create/expert.request";

const defaults: ExpertSnapshot = {
  infer_method: "ode", shift: 3, timesteps: "", use_adg: false,
  cfg_interval_start: 0, cfg_interval_end: 1,
  dcw_override: "auto", dcw_mode: "double", dcw_scaler: 0.05,
  dcw_high_scaler: 0.02, dcw_wavelet: "haar",
  use_cot_caption: false, use_cot_language: false,
  lm_temperature: 0.85, lm_cfg_scale: 2.5, lm_top_k: 0, lm_top_p: 0.9
};

describe("model-specific DCW safety", () => {
  it("omits the override entirely when set to Auto", () => {
    const request = mapExpertRequest(defaults);
    expect(Object.prototype.hasOwnProperty.call(request, "dcw_enabled")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(request, "dcw_mode")).toBe(false);
  });
  it("forwards an explicit disabled override without wavelet options", () => {
    expect(mapExpertRequest({ ...defaults, dcw_override: "off" })).toMatchObject({
      dcw_enabled: false
    });
  });
  it("forwards explicit enabled wavelet correction with exact scalers", () => {
    const actual = mapExpertRequest({ ...defaults, dcw_override: "on",
      dcw_mode: "high", dcw_scaler: 0.07, dcw_wavelet: "db4" });
    expect(actual).toMatchObject({
      dcw_enabled: true, dcw_mode: "high", dcw_scaler: 0.07,
      dcw_high_scaler: 0.02, dcw_wavelet: "db4"
    });
  });
  it("rejects an unrecognized correction basis", () => {
    expect(() => mapExpertRequest({ ...defaults, dcw_wavelet: "invalid" })).toThrow("wavelet");
  });
});

describe("advanced diffusion and LM settings", () => {
  it("normalizes strict custom timesteps", () => {
    expect(normalizeTimesteps(" 0.97 , 0.5, 0 ")).toBe("0.97,0.5,0");
    expect(normalizeTimesteps("  ")).toBeUndefined();
  });
  it.each(["0.5", "0.4,0.5", "0.5,0.5", "NaN,0.1", "1.5,0", "0.5,,0"])(
    "rejects malformed schedule %s", value => {
      expect(() => normalizeTimesteps(value)).toThrow();
    });
  it("enforces the CFG range, LM sampling, and known methods", () => {
    expect(() => mapExpertRequest({ ...defaults, cfg_interval_start: 0.8,
      cfg_interval_end: 0.2 })).toThrow("interval");
    expect(() => mapExpertRequest({ ...defaults, lm_top_p: 1.1 })).toThrow("top-p");
    expect(() => mapExpertRequest({ ...defaults, infer_method: "unknown" })).toThrow("method");
    expect(() => mapExpertRequest({ ...defaults, lm_top_k: 1.5 })).toThrow("integer");
  });
  it("preserves CoT opt-ins without implying LM thinking", () => {
    const actual = mapExpertRequest({ ...defaults, infer_method: "sde",
      timesteps: "0.97,0.5,0", use_adg: true, lm_top_k: 42,
      use_cot_caption: true, use_cot_language: true });
    expect(actual).toMatchObject({ infer_method: "sde", timesteps: "0.97,0.5,0",
      use_adg: true, lm_top_k: 42, use_cot_caption: true, use_cot_language: true });
  });
});
