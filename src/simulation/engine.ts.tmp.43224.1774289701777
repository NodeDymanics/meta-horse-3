// ============================================================
// Meta.Horse 2 — Race Simulation Engine
// ============================================================
// Runs the full deterministic simulation and produces a GmaxRaceRecord
// with all horse state in Gmax Point Data Feed format.

import type { Horse, HorseRuntimeState } from '../types/horse';
import type { GmaxDataPoint, GmaxRaceRecord, GmaxCheckpoint, RaceEvent } from '../types/gmax';
import { createRNGFromString, clamp } from '../core/rng';
import { encodeGmaxId, deriveRaceDateTime, raceTimestamp } from '../core/gmax-id';
import { generateHorses } from '../generation/horses';
import { computeTargetVelocity, RACE_DISTANCE } from './phases';
import { computeStrideFrequency } from './stride';
import { getTrackGeometry, distanceToGps } from '../core/coordinate-system';
import { ABSTRACT_TRACK } from '../generation/tracks';
import { generateCommentary } from '../commentary/engine';

// --------------- Simulation Parameters ---------------
const DT = 0.04;
const CHECKPOINT_INTERVAL = 10;
const SIMULATED_COURSE_CODE = '999';

function accelRate(acc: number): number {
  return 1.5 + acc * 3.5;
}

const BURST_DURATION_METERS = 60;
const BURST_SPEED_BOOST = 0.12;

function positionBoost(rank: number, totalHorses: number): number {
  if (rank === 1) return -0.01;
  if (rank <= 3)  return 0.005;
  if (rank > totalHorses - 3) return 0.0;
  return 0.003;
}

function initRuntimeStates(horses: Horse[]): HorseRuntimeState[] {
  return horses.map(h => ({
    horseId:         h.id,
    position:        0,
    velocity:        8.0,
    targetVelocity:  8.0,
    fatigue:         0,
    burstActive:     false,
    burstRemaining:  0,
    finished:        false,
    finishTime:      0,
    rank:            h.id + 1,
  }));
}

function updateRanks(states: HorseRuntimeState[]): void {
  const sorted = states.slice().sort((a, b) => b.position - a.position);
  sorted.forEach((s, i) => { s.rank = i + 1; });
}

// --------------- Event Detection ---------------
interface PrevSnapshot {
  horseId: number;
  position: number;
  rank: number;
}

function detectEvents(
  prev: PrevSnapshot[],
  curr: HorseRuntimeState[],
): RaceEvent[] {
  if (!prev.length) return [];
  const events: RaceEvent[] = [];

  const prevLeader = prev.reduce((a, b) => a.rank < b.rank ? a : b);
  const currLeader = curr.reduce((a, b) => a.rank < b.rank ? a : b);

  if (currLeader.horseId !== prevLeader.horseId) {
    events.push({ type: 'lead-change', horseIds: [currLeader.horseId, prevLeader.horseId] });
  }

  const sorted = curr.slice().sort((a, b) => b.position - a.position);
  if (sorted.length >= 2 && Math.abs(sorted[0].position - sorted[1].position) < 2.5) {
    events.push({ type: 'neck-and-neck', horseIds: [sorted[0].horseId, sorted[1].horseId] });
  }

  if (sorted.length >= 2 && sorted[0].position - sorted[1].position > 8) {
    events.push({ type: 'breaking-away', horseIds: [sorted[0].horseId] });
  }

  for (const cs of curr) {
    const ps = prev.find(p => p.horseId === cs.horseId);
    if (ps && ps.rank - cs.rank >= 3) {
      events.push({ type: 'surge', horseIds: [cs.horseId] });
    }
  }

  for (const cs of curr) {
    const ps = prev.find(p => p.horseId === cs.horseId);
    if (ps && cs.rank - ps.rank >= 3) {
      events.push({ type: 'falter', horseIds: [cs.horseId] });
    }
  }

  return events;
}

// --------------- Build Gmax Data Point ---------------
function buildGmaxDataPoint(
  state: HorseRuntimeState,
  horse: Horse,
  baseTime: Date,
  time: number,
  raceIdPrefix: string,
): GmaxDataPoint {
  const track = getTrackGeometry();
  const profile = ABSTRACT_TRACK;

  const distance = Math.min(state.position, RACE_DISTANCE);
  const gps = distanceToGps(distance, horse.visual.lane, track, profile);

  return {
    T:  raceTimestamp(baseTime, time),
    I:  raceIdPrefix + String(horse.number).padStart(2, '0'),
    X:  parseFloat(gps.lng.toFixed(7)),
    Y:  parseFloat(gps.lat.toFixed(7)),
    V:  parseFloat(state.velocity.toFixed(2)),
    P:  parseFloat((RACE_DISTANCE - distance).toFixed(1)),
    SF: parseFloat(computeStrideFrequency(state.velocity, horse.stats.strideLength).toFixed(2)),
  };
}

// --------------- Main Simulation ---------------
export function runSimulation(seed: string): GmaxRaceRecord {
  const rng = createRNGFromString(seed);

  const horses = generateHorses(rng);
  const states = initRuntimeStates(horses);

  // Derive race metadata from seed
  const baseTime = deriveRaceDateTime(seed);
  const raceIdPrefix = encodeGmaxId(SIMULATED_COURSE_CODE, baseTime, 0).slice(0, -2); // strip horse number

  const checkpoints: GmaxCheckpoint[] = [];
  let time = 0;
  let nextCheckpointDist = 0;

  const burstChance = (h: Horse) => 0.002 + h.stats.burstCapability * 0.003;

  let prevSnapshots: PrevSnapshot[] = [];

  const recordCheckpoint = (leaderDist: number): void => {
    updateRanks(states);

    const gmaxPoints = states.map((s, i) => buildGmaxDataPoint(s, horses[i], baseTime, time, raceIdPrefix));
    const events = detectEvents(prevSnapshots, states);
    const commentary = generateCommentary(horses, gmaxPoints, events, leaderDist, checkpoints);

    checkpoints.push({
      leaderDistance: leaderDist,
      time,
      timestamp: raceTimestamp(baseTime, time),
      horses: gmaxPoints,
      events,
      commentary,
    });

    prevSnapshots = states.map(s => ({
      horseId: s.horseId,
      position: s.position,
      rank: s.rank,
    }));
  };

  // Record starting checkpoint
  recordCheckpoint(0);
  nextCheckpointDist = CHECKPOINT_INTERVAL;

  const MAX_TIME = 300;
  let allFinished = false;

  while (!allFinished && time < MAX_TIME) {
    time += DT;

    for (let i = 0; i < states.length; i++) {
      const s = states[i];
      if (s.finished) continue;

      const h = horses[i];
      const erraticNoise = rng();

      let tv = computeTargetVelocity(
        h.stats.archetype,
        h.stats.baseSpeed,
        h.stats.stamina,
        s.position,
        erraticNoise,
      );

      tv *= (1 + positionBoost(s.rank, 12));

      const consistencyNoise = (rng() - 0.5) * (1 - h.stats.consistency) * 0.12;
      tv *= (1 + consistencyNoise);

      if (!s.burstActive && rng() < burstChance(h) && s.position > 50) {
        s.burstActive    = true;
        s.burstRemaining = BURST_DURATION_METERS;
      }

      if (s.burstActive) {
        tv *= (1 + BURST_SPEED_BOOST * h.stats.burstCapability);
        s.burstRemaining -= s.velocity * DT;
        if (s.burstRemaining <= 0) {
          s.burstActive    = false;
          s.burstRemaining = 0;
        }
      }

      const rate = accelRate(h.stats.acceleration);
      const diff = tv - s.velocity;
      s.velocity = s.velocity + clamp(diff, -rate * DT, rate * DT);
      s.velocity = Math.max(8.0, s.velocity);

      s.position += s.velocity * DT;

      s.fatigue = Math.min(1, s.position / RACE_DISTANCE * (1.5 - h.stats.stamina));

      if (s.position >= RACE_DISTANCE && !s.finished) {
        s.finished   = true;
        s.finishTime = time;
        s.position   = RACE_DISTANCE;
      }
    }

    const leader = states.reduce((best, s) => s.position > best.position ? s : best, states[0]);

    while (nextCheckpointDist <= RACE_DISTANCE && leader.position >= nextCheckpointDist) {
      recordCheckpoint(nextCheckpointDist);
      nextCheckpointDist += CHECKPOINT_INTERVAL;
    }

    allFinished = states.every(s => s.finished);
  }

  for (const s of states) {
    if (!s.finished) {
      s.finished   = true;
      s.finishTime = time;
    }
  }

  if (checkpoints[checkpoints.length - 1]?.leaderDistance !== RACE_DISTANCE) {
    recordCheckpoint(RACE_DISTANCE);
  }

  updateRanks(states);
  const finishedSorted = states.slice().sort((a, b) => a.finishTime - b.finishTime);
  const top3   = finishedSorted.slice(0, 3).map(s => s.horseId);
  const winner = finishedSorted[0].horseId;

  const finishTimes = new Map<number, number>();
  for (const s of states) {
    finishTimes.set(s.horseId, s.finishTime);
  }

  return {
    seed,
    raceId: raceIdPrefix,
    horses,
    checkpoints,
    winner,
    top3,
    finishTimes,
  };
}
