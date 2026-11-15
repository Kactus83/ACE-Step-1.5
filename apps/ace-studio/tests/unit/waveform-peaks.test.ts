/**
 * @module waveform-peaks-test
 * @remarks Pure tests for waveform downsampling and repaint range invariants.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { clampRepaintRange, waveformPeaks } from "../../src/app/features/create/waveform.peaks";

describe("repaint waveform helpers", () => {
  it("renders bounded, nonnegative amplitudes for a PCM channel", () => {
    const bins = waveformPeaks(new Float32Array([0, -1, 0.5, 0]), 4);
    expect(bins).toEqual([0, 1, 0.5, 0]);
  });
  it("retains silence and caps invalid requested bin counts", () => {
    expect(waveformPeaks(new Float32Array(), 3)).toEqual([0, 0, 0]);
    expect(() => waveformPeaks(new Float32Array([1]), 5000)).toThrow("resolution");
  });
  it("preserves nonzero intervals when dragged past the other handle", () => {
    expect(clampRepaintRange(100, 1, 30)).toEqual({ start: 29.5, end: 30 });
    expect(clampRepaintRange(-10, 5, 30)).toEqual({ start: 0, end: 5 });
  });
  it("rejects non-finite values", () => {
    expect(() => clampRepaintRange(0, Infinity, 3)).toThrow("finite");
  });
});

