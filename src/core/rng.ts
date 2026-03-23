// ============================================================
// Meta.Horse 2 — Seeded RNG (Mulberry32)
// ============================================================
// All randomness in the simulation MUST go through this.

import type { RNG } from '../types/horse';

export function createRNG(seed: number): RNG {
  let state = seed >>> 0;
  return function mulberry32(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let z = Math.imul(state ^ (state >>> 15), 1 | state);
    z ^= z + Math.imul(z ^ (z >>> 7), 61 | z);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h, 33) ^ seed.charCodeAt(i);
    h = h >>> 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 16;
  return h >>> 0;
}

export function createRNGFromString(seed: string): RNG {
  return createRNG(hashSeed(seed || 'METAHORSE'));
}

export function rngInt(rng: RNG, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function rngFloat(rng: RNG, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function rngPick<T>(rng: RNG, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function rngPickN<T>(rng: RNG, arr: T[], n: number): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export function rngGaussian(rng: RNG, mean: number, stdDev: number): number {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(t: number): number {
  t = clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
}
