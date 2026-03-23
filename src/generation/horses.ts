// ============================================================
// Meta.Horse 2 — Horse Generation
// ============================================================

import type { Horse, HorseStats, HorseVisual, HorseArchetype, RacePhase, RNG } from '../types/horse';
import { rngPick, clamp, rngGaussian } from '../core/rng';

// --------------- Name Generation ---------------
const NAME_PREFIXES = [
  'Iron', 'Golden', 'Dark', 'Silver', 'Noble',
  'Wild', 'Scarlet', 'Midnight', 'Emerald', 'Thunder',
  'Royal', 'Stone', 'Brave', 'Swift', 'Burning',
  'Ancient', 'Shadow', 'Copper', 'Phantom', 'Crimson',
];

const NAME_CORES = [
  'Storm', 'Arrow', 'Legend', 'Flame', 'Spirit',
  'Fury', 'Prince', 'Star', 'Wind', 'Dawn',
  'Fire', 'King', 'Comet', 'Thunder', 'Falcon',
  'Ridge', 'River', 'Echo', 'Crest', 'Force',
];

const NAME_SUFFIXES = [
  'Runner', 'Flash', 'Blade', 'Strike', 'Dancer',
  'Blaze', 'Charge', 'Quest', 'Bound', 'Wave',
];

function generateName(rng: RNG, usedNames: Set<string>): string {
  let attempts = 0;
  while (attempts < 30) {
    const prefix = rngPick(rng, NAME_PREFIXES);
    const core   = rngPick(rng, NAME_CORES);
    const suffix = rng() < 0.5 ? (' ' + rngPick(rng, NAME_SUFFIXES)) : '';
    const name = `${prefix} ${core}${suffix}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
    attempts++;
  }
  const n = usedNames.size + 1;
  const fallback = `Horse ${n}`;
  usedNames.add(fallback);
  return fallback;
}

// --------------- Archetype Definitions ---------------
const ARCHETYPES: HorseArchetype[] = [
  'front-runner', 'presser', 'stalker', 'closer',
  'erratic', 'grinder', 'explosive-finisher', 'steady-durable',
];

const ARCHETYPE_WEIGHTS = [2, 2, 2, 2, 1, 2, 1, 2];

function weightedPickArchetype(rng: RNG): HorseArchetype {
  const total = ARCHETYPE_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < ARCHETYPES.length; i++) {
    r -= ARCHETYPE_WEIGHTS[i];
    if (r <= 0) return ARCHETYPES[i];
  }
  return ARCHETYPES[ARCHETYPES.length - 1];
}

const ARCHETYPE_PREFERRED_PHASE: Record<HorseArchetype, RacePhase> = {
  'front-runner':       'start',
  'presser':            'early',
  'stalker':            'mid',
  'closer':             'bend',
  'erratic':            'mid',
  'grinder':            'mid',
  'explosive-finisher': 'stretch',
  'steady-durable':     'early',
};

interface StatRange { min: number; max: number }
type ArchetypeStatProfile = {
  baseSpeed: StatRange;
  acceleration: StatRange;
  stamina: StatRange;
  burstCapability: StatRange;
  consistency: StatRange;
  temperament: StatRange;
  strideLength: StatRange;
};

const ARCHETYPE_PROFILES: Record<HorseArchetype, ArchetypeStatProfile> = {
  'front-runner': {
    baseSpeed: { min: 0.70, max: 0.95 }, acceleration: { min: 0.75, max: 0.95 },
    stamina: { min: 0.30, max: 0.60 }, burstCapability: { min: 0.40, max: 0.65 },
    consistency: { min: 0.55, max: 0.80 }, temperament: { min: 0.50, max: 0.80 },
    strideLength: { min: 0.50, max: 0.80 },
  },
  'presser': {
    baseSpeed: { min: 0.65, max: 0.88 }, acceleration: { min: 0.60, max: 0.80 },
    stamina: { min: 0.45, max: 0.70 }, burstCapability: { min: 0.40, max: 0.65 },
    consistency: { min: 0.60, max: 0.85 }, temperament: { min: 0.55, max: 0.80 },
    strideLength: { min: 0.40, max: 0.70 },
  },
  'stalker': {
    baseSpeed: { min: 0.60, max: 0.85 }, acceleration: { min: 0.55, max: 0.75 },
    stamina: { min: 0.55, max: 0.80 }, burstCapability: { min: 0.50, max: 0.75 },
    consistency: { min: 0.60, max: 0.85 }, temperament: { min: 0.60, max: 0.85 },
    strideLength: { min: 0.45, max: 0.75 },
  },
  'closer': {
    baseSpeed: { min: 0.70, max: 0.92 }, acceleration: { min: 0.50, max: 0.70 },
    stamina: { min: 0.65, max: 0.88 }, burstCapability: { min: 0.60, max: 0.85 },
    consistency: { min: 0.55, max: 0.80 }, temperament: { min: 0.60, max: 0.85 },
    strideLength: { min: 0.55, max: 0.85 },
  },
  'erratic': {
    baseSpeed: { min: 0.55, max: 0.90 }, acceleration: { min: 0.40, max: 0.90 },
    stamina: { min: 0.30, max: 0.70 }, burstCapability: { min: 0.65, max: 0.95 },
    consistency: { min: 0.15, max: 0.45 }, temperament: { min: 0.10, max: 0.40 },
    strideLength: { min: 0.30, max: 0.90 },
  },
  'grinder': {
    baseSpeed: { min: 0.55, max: 0.75 }, acceleration: { min: 0.45, max: 0.65 },
    stamina: { min: 0.75, max: 0.95 }, burstCapability: { min: 0.30, max: 0.55 },
    consistency: { min: 0.70, max: 0.90 }, temperament: { min: 0.70, max: 0.90 },
    strideLength: { min: 0.35, max: 0.65 },
  },
  'explosive-finisher': {
    baseSpeed: { min: 0.72, max: 0.96 }, acceleration: { min: 0.45, max: 0.65 },
    stamina: { min: 0.55, max: 0.80 }, burstCapability: { min: 0.80, max: 1.00 },
    consistency: { min: 0.45, max: 0.70 }, temperament: { min: 0.50, max: 0.75 },
    strideLength: { min: 0.60, max: 0.90 },
  },
  'steady-durable': {
    baseSpeed: { min: 0.60, max: 0.80 }, acceleration: { min: 0.50, max: 0.70 },
    stamina: { min: 0.70, max: 0.90 }, burstCapability: { min: 0.35, max: 0.55 },
    consistency: { min: 0.75, max: 0.95 }, temperament: { min: 0.75, max: 0.95 },
    strideLength: { min: 0.40, max: 0.70 },
  },
};

function generateStats(rng: RNG, archetype: HorseArchetype): HorseStats {
  const p = ARCHETYPE_PROFILES[archetype];
  const stat = (r: StatRange): number =>
    clamp(rngGaussian(rng, (r.min + r.max) / 2, (r.max - r.min) / 4), r.min, r.max);

  return {
    baseSpeed:       stat(p.baseSpeed),
    acceleration:    stat(p.acceleration),
    stamina:         stat(p.stamina),
    burstCapability: stat(p.burstCapability),
    consistency:     stat(p.consistency),
    temperament:     stat(p.temperament),
    strideLength:    stat(p.strideLength),
    preferredPhase:  ARCHETYPE_PREFERRED_PHASE[archetype],
    archetype,
  };
}

// --------------- Visual Generation ---------------
const BODY_COLORS = [
  '#e84040', '#f08030', '#e8c030', '#38b848',
  '#30b8a8', '#3880e0', '#9048c8', '#e84898',
  '#20c898', '#e86820', '#c0c0d0', '#7878a8',
];

const MANE_DARK  = '#1a1008';
const MANE_LIGHT = '#f0e0b0';
const MANE_GREY  = '#888';

function generateVisual(rng: RNG, lane: number): HorseVisual {
  const bodyColor = BODY_COLORS[lane % 12];
  const maneColor = rngPick(rng, [MANE_DARK, MANE_LIGHT, MANE_GREY]);

  const saddleColors = [
    '#ff2020', '#ff8000', '#ffd000', '#00cc44',
    '#00aacc', '#0060ee', '#8822ee', '#ee2288',
    '#00ddaa', '#ff4400', '#ffffff', '#6688aa',
  ];
  const saddleColor = saddleColors[lane % 12];
  const numberColor = lane === 10 ? '#000000' : '#ffffff';

  return { bodyColor, maneColor, saddleColor, numberColor, lane };
}

// --------------- Main Generator ---------------
export function generateHorses(rng: RNG): Horse[] {
  const usedNames = new Set<string>();
  const horses: Horse[] = [];

  const saddleNumbers = Array.from({ length: 12 }, (_, i) => i + 1);
  for (let i = saddleNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [saddleNumbers[i], saddleNumbers[j]] = [saddleNumbers[j], saddleNumbers[i]];
  }

  for (let i = 0; i < 12; i++) {
    const archetype = weightedPickArchetype(rng);
    const stats     = generateStats(rng, archetype);
    const name      = generateName(rng, usedNames);
    const visual    = generateVisual(rng, i);

    horses.push({ id: i, number: saddleNumbers[i], name, stats, visual });
  }

  return horses;
}
