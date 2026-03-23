// ============================================================
// Meta.Horse 2 — Race Phases & Archetype Modifiers
// ============================================================

import type { RacePhase, HorseArchetype } from '../types/horse';

export const RACE_DISTANCE = 1200;

export const PHASE_BOUNDARIES: Record<RacePhase, [number, number]> = {
  start:   [0,    100],
  early:   [100,  400],
  mid:     [400,  700],
  bend:    [700,  900],
  stretch: [900,  1200],
};

export function getPhase(distance: number): RacePhase {
  if (distance < 100)  return 'start';
  if (distance < 400)  return 'early';
  if (distance < 700)  return 'mid';
  if (distance < 900)  return 'bend';
  return 'stretch';
}

export const PHASE_MODIFIERS: Record<HorseArchetype, Record<RacePhase, number>> = {
  'front-runner': {
    start: 1.12, early: 1.08, mid: 1.00, bend: 0.94, stretch: 0.88,
  },
  'presser': {
    start: 1.06, early: 1.05, mid: 1.02, bend: 0.97, stretch: 0.92,
  },
  'stalker': {
    start: 0.94, early: 0.98, mid: 1.03, bend: 1.02, stretch: 1.00,
  },
  'closer': {
    start: 0.82, early: 0.88, mid: 0.97, bend: 1.06, stretch: 1.14,
  },
  'erratic': {
    start: 1.00, early: 1.00, mid: 1.00, bend: 1.00, stretch: 1.00,
  },
  'grinder': {
    start: 0.95, early: 0.98, mid: 1.01, bend: 1.01, stretch: 1.03,
  },
  'explosive-finisher': {
    start: 0.80, early: 0.86, mid: 0.94, bend: 1.08, stretch: 1.22,
  },
  'steady-durable': {
    start: 1.00, early: 1.00, mid: 1.00, bend: 1.00, stretch: 1.00,
  },
};

export const ERRATIC_VARIANCE: Record<RacePhase, number> = {
  start: 0.20, early: 0.18, mid: 0.22, bend: 0.20, stretch: 0.25,
};

export function baseMaxVelocity(baseSpeed: number): number {
  return 13.5 + baseSpeed * 5.0;
}

export function fatigueMult(distanceTraveled: number, stamina: number): number {
  const fatigueRate = 1.5 - stamina * 1.0;
  const rawFatigue  = (distanceTraveled / RACE_DISTANCE) * fatigueRate;
  return Math.max(0.65, 1.0 - rawFatigue * 0.35);
}

export function computeTargetVelocity(
  archetype: HorseArchetype,
  baseSpeed: number,
  stamina: number,
  distanceTraveled: number,
  erraticNoise: number,
): number {
  const phase   = getPhase(distanceTraveled);
  let phaseMod  = PHASE_MODIFIERS[archetype][phase];

  if (archetype === 'erratic') {
    const amp  = ERRATIC_VARIANCE[phase];
    const sign = erraticNoise < 0.5 ? -1 : 1;
    phaseMod  += sign * amp * Math.abs(erraticNoise - 0.5) * 2;
    phaseMod   = Math.max(0.70, Math.min(1.30, phaseMod));
  }

  const maxV    = baseMaxVelocity(baseSpeed);
  const fatMult = fatigueMult(distanceTraveled, stamina);

  return maxV * phaseMod * fatMult;
}
