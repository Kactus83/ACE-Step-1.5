/**
 * @module training-loss
 * @remarks Bounded, backend-authoritative training loss SVG plot computation.
 * @public
 */

/** @public An individual loss point emitted by ACE-Step training. */
export interface LossPoint { readonly step: number; readonly loss: number; }

/** @public Safe numeric plot, with measured bounds rather than invented metrics. */
export interface LossPlot {
  readonly points: string;
  readonly min: number;
  readonly max: number;
  readonly count: number;
  readonly firstStep: number;
  readonly lastStep: number;
}

/**
 * @public Draw at most 120 samples without guessing intermediate loss values.
 * @remarks A flat series is centered so that it remains visible.
 */
export function buildLossPlot(history: readonly LossPoint[]): LossPlot | null {
  const valid = history.filter(item => Number.isFinite(item.step)
    && Number.isFinite(item.loss) && item.step >= 0).slice(-1000);
  if (!valid.length) return null;
  const sampled: LossPoint[] = [];
  const size = Math.min(120, valid.length);
  for (let i = 0; i < size; i++) {
    const index = size === 1 ? 0 : Math.round(i * (valid.length - 1) / (size - 1));
    const value = valid[index];
    if (value) sampled.push(value);
  }
  const min = Math.min(...valid.map(p => p.loss));
  const max = Math.max(...valid.map(p => p.loss));
  const firstStep = valid[0]?.step || 0;
  const lastStep = valid[valid.length - 1]?.step || 0;
  const range = max - min || 1;
  const span = lastStep - firstStep || 1;
  const points = sampled.map(p => {
    const x = 15 + 610 * (p.step - firstStep) / span;
    const y = max === min ? 80 : 145 - 130 * (p.loss - min) / range;
    return x.toFixed(2) + "," + y.toFixed(2);
  }).join(" ");
  return { points, min, max, count: valid.length, firstStep, lastStep };
}

