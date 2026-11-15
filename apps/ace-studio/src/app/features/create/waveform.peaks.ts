/**
 * @module waveform-peaks
 * @remarks Pure, bounded aggregation for lightweight client-side waveform display.
 * No user audio bytes are retained persistently.
 * @public
 */

/**
 * @public Sample at most `count` amplitude peaks from a PCM channel.
 * @throws Error when the desired count is outside a safe UI range.
 */
export function waveformPeaks(samples: Float32Array, count = 96): readonly number[] {
  if (!Number.isSafeInteger(count) || count < 1 || count > 512) {
    throw new Error("Waveform resolution must be 1–512 points.");
  }
  if (!samples.length) return Array.from({ length: count }, () => 0);
  const values: number[] = [];
  for (let i = 0; i < count; i++) {
    const start = Math.floor(samples.length * i / count);
    const end = Math.min(samples.length, Math.max(start + 1,
      Math.floor(samples.length * (i + 1) / count)));
    const stride = Math.max(1, Math.floor((end - start) / 160));
    let peak = 0;
    for (let j = start; j < end; j += stride) {
      const sample = samples[j] || 0;
      peak = Math.max(peak, Math.min(1, Math.abs(sample)));
    }
    values.push(peak);
  }
  return values;
}

/**
 * @public Constrain a repaint range to a decoded source duration.
 * @remarks Maintains a positive half-second interval where audio permits one.
 */
export function clampRepaintRange(
  start: number, end: number, duration: number
): { start: number; end: number } {
  if (![start, end, duration].every(Number.isFinite) || duration <= 0) {
    throw new Error("Audio duration and repaint boundaries must be finite and positive.");
  }
  const gap = Math.min(0.5, duration);
  const safeStart = Math.max(0, Math.min(duration - gap, start));
  const safeEnd = Math.max(safeStart + gap, Math.min(duration, end));
  return { start: safeStart, end: safeEnd };
}

