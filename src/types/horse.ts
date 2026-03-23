// ============================================================
// Meta.Horse 2 — Horse Type Definitions
// ============================================================

export type RNG = () => number;

export type HorseArchetype =
  | 'front-runner'
  | 'presser'
  | 'stalker'
  | 'closer'
  | 'erratic'
  | 'grinder'
  | 'explosive-finisher'
  | 'steady-durable';

export type RacePhase =
  | 'start'     // 0–100m
  | 'early'     // 100–400m
  | 'mid'       // 400–700m
  | 'bend'      // 700–900m
  | 'stretch';  // 900–1200m

export interface HorseStats {
  baseSpeed: number;
  acceleration: number;
  stamina: number;
  burstCapability: number;
  consistency: number;
  temperament: number;
  /** Per-horse stride length factor (0-1). Higher = longer stride, lower SF at same speed */
  strideLength: number;
  preferredPhase: RacePhase;
  archetype: HorseArchetype;
}

export interface HorseVisual {
  bodyColor: string;
  maneColor: string;
  saddleColor: string;
  numberColor: string;
  lane: number;
}

export interface Horse {
  id: number;
  number: number;
  name: string;
  stats: HorseStats;
  visual: HorseVisual;
}

export interface HorseRuntimeState {
  horseId: number;
  position: number;
  velocity: number;
  targetVelocity: number;
  fatigue: number;
  burstActive: boolean;
  burstRemaining: number;
  finished: boolean;
  finishTime: number;
  rank: number;
}
