// ============================================================
// Meta.Horse 2 — Stride Frequency Model
// ============================================================
// Real thoroughbreds stride at ~2.0-2.5 Hz at race pace.
// SF = baseFreq + velocityFactor * velocity, modified by strideLength.

/**
 * Compute stride frequency (Hz) from velocity and horse stride length.
 * @param velocity Current speed in m/s
 * @param strideLength 0-1 stat (higher = longer stride = lower frequency at same speed)
 */
export function computeStrideFrequency(velocity: number, strideLength: number): number {
  if (velocity < 0.5) return 0;

  // Base stride length in meters: 5.5m to 7.5m depending on stat
  const strideLengthMeters = 5.5 + strideLength * 2.0;

  // SF = velocity / stride_length
  // At 16 m/s with 6.5m stride: 2.46 Hz
  // At 8 m/s with 6.5m stride: 1.23 Hz
  const sf = velocity / strideLengthMeters;

  // Clamp to realistic range
  return Math.max(0.5, Math.min(3.0, sf));
}
