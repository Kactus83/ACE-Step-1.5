/**
 * @module training-loss-tests
 * @remarks Numeric bounds and empty/invalid training history behavior.
 * @internal
 */
import { describe, expect, it } from "vitest";
import { buildLossPlot } from "../../src/app/features/training/training-loss";

describe("authoritative loss chart", () => {
  it("produces an actual bounded trace for finite server samples", () => {
    const plot = buildLossPlot([{ step: 1, loss: 0.5 }, { step: 2, loss: 0.25 }]);
    expect(plot?.count).toBe(2);
    expect(plot?.min).toBe(0.25);
    expect(plot?.max).toBe(0.5);
    expect(plot?.points).toContain("15.00,15.00");
  });
  it("remains valid for a constant loss and ignores corrupt numeric values", () => {
    const plot = buildLossPlot([
      { step: 1, loss: 0.1 }, { step: 2, loss: 0.1 },
      { step: 3, loss: Number.NaN }
    ]);
    expect(plot?.count).toBe(2);
    expect(plot?.points).toContain(",80.00");
    expect(buildLossPlot([])).toBeNull();
  });
  it("never generates more than 120 SVG sample pairs", () => {
    const history = Array.from({ length: 1000 },
      (_, step) => ({ step, loss: 1 / (step + 1) }));
    expect(buildLossPlot(history)?.points.split(" ")).toHaveLength(120);
  });
});

