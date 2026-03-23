// ============================================================
// Meta.Horse 2 — Commentary Engine
// ============================================================
// Generates commentary for each checkpoint, adapted from V1
// to work with GmaxDataPoint instead of HorseSnapshot.

import type { Horse } from '../types/horse';
import type { GmaxDataPoint, RaceEvent, GmaxCheckpoint } from '../types/gmax';
import { PHRASES } from './phrases';
import { getPhase, RACE_DISTANCE } from '../simulation/phases';

const ANTI_REPEAT_WINDOW = 12;
const recentPhrases = new Set<string>();
const recentQueue: string[] = [];

function markUsed(phrase: string): void {
  if (recentQueue.length >= ANTI_REPEAT_WINDOW) {
    const oldest = recentQueue.shift()!;
    recentPhrases.delete(oldest);
  }
  recentQueue.push(phrase);
  recentPhrases.add(phrase);
}

function resetAntiRepeat(): void {
  recentPhrases.clear();
  recentQueue.length = 0;
}

function pickFresh(pool: string[], seed: number): string {
  const fresh = pool.filter(p => !recentPhrases.has(p));
  const src = fresh.length > 0 ? fresh : pool;
  const idx = Math.abs(seed * 6271 + seed) % src.length;
  const chosen = src[Math.floor(idx) % src.length];
  markUsed(chosen);
  return chosen;
}

/** Get position (distance traveled) from Gmax P field */
function getPosition(dp: GmaxDataPoint): number {
  return RACE_DISTANCE - dp.P;
}

/** Get rank by sorting data points (lower P = further ahead = better rank) */
function getRank(dp: GmaxDataPoint, all: GmaxDataPoint[]): number {
  const sorted = all.slice().sort((a, b) => a.P - b.P);
  return sorted.findIndex(s => s.I === dp.I) + 1;
}

interface SnapLike {
  horseId: number;
  rank: number;
  position: number;
}

function toSnapLike(dp: GmaxDataPoint, horses: Horse[], all: GmaxDataPoint[]): SnapLike {
  const horse = horses.find(h => dp.I.endsWith(String(h.number).padStart(2, '0')));
  return {
    horseId: horse?.id ?? 0,
    rank: getRank(dp, all),
    position: getPosition(dp),
  };
}

function substitute(
  template: string,
  horses: Horse[],
  snaps: SnapLike[],
  extraVars: Record<string, string> = {},
): string {
  const leader = snaps.reduce((a, b) => a.rank < b.rank ? a : b);
  const second = snaps.find(s => s.rank === 2);
  const third  = snaps.find(s => s.rank === 3);

  const leaderHorse = horses.find(h => h.id === leader.horseId)!;
  const secondHorse = second ? horses.find(h => h.id === second.horseId) : null;
  const thirdHorse  = third  ? horses.find(h => h.id === third.horseId)  : null;

  let result = template;
  result = result.replace(/{name}/g,  leaderHorse?.name  ?? 'the leader');
  result = result.replace(/{name2}/g, secondHorse?.name  ?? 'the runner-up');
  result = result.replace(/{name3}/g, thirdHorse?.name   ?? 'third place');

  for (const [k, v] of Object.entries(extraVars)) {
    result = result.replace(new RegExp(`{${k}}`, 'g'), v);
  }

  return result;
}

function horse(horses: Horse[], id: number): Horse {
  return horses.find(h => h.id === id) ?? horses[0];
}

export function generateCommentary(
  horses: Horse[],
  dataPoints: GmaxDataPoint[],
  events: RaceEvent[],
  dist: number,
  prevCPs: GmaxCheckpoint[],
): string[] {
  if (dist === 0) {
    resetAntiRepeat();
    return [pickFresh(PHRASES.start, 0)];
  }

  const phase = getPhase(dist);
  const seed  = dist;
  const lines: string[] = [];
  const vars  = { dist: `${dist}m` };

  const snaps = dataPoints.map(dp => toSnapLike(dp, horses, dataPoints));

  for (const evt of events) {
    if (lines.length >= 3) break;

    switch (evt.type) {
      case 'lead-change': {
        const newLeader = horse(horses, evt.horseIds[0]);
        const oldLeader = horse(horses, evt.horseIds[1]);
        const t = pickFresh(PHRASES.leadChange, seed + lines.length);
        lines.push(substitute(t, horses, snaps, { ...vars, name: newLeader.name, name2: oldLeader.name }));
        break;
      }
      case 'neck-and-neck': {
        const h1 = horse(horses, evt.horseIds[0]);
        const h2 = horse(horses, evt.horseIds[1]);
        const t  = pickFresh(PHRASES.neckAndNeck, seed + lines.length);
        lines.push(substitute(t, horses, snaps, { ...vars, name: h1.name, name2: h2.name }));
        break;
      }
      case 'breaking-away': {
        const h1 = horse(horses, evt.horseIds[0]);
        const t  = pickFresh(PHRASES.breakingAway, seed + lines.length);
        lines.push(substitute(t, horses, snaps, { ...vars, name: h1.name }));
        break;
      }
      case 'surge': {
        const h1 = horse(horses, evt.horseIds[0]);
        const t  = pickFresh(PHRASES.surge, seed + lines.length);
        lines.push(substitute(t, horses, snaps, { ...vars, name: h1.name }));
        break;
      }
      case 'falter': {
        const h1 = horse(horses, evt.horseIds[0]);
        const t  = pickFresh(PHRASES.falter, seed + lines.length);
        lines.push(substitute(t, horses, snaps, { ...vars, name: h1.name }));
        break;
      }
      case 'finish': {
        const winner = horse(horses, evt.horseIds[0]);
        const t      = pickFresh(PHRASES.winner, seed);
        const secondSnap = snaps.find(s => s.rank === 2);
        lines.push(substitute(t, horses, snaps, {
          ...vars,
          name: winner.name,
          name2: secondSnap ? horse(horses, secondSnap.horseId).name : '',
        }));
        break;
      }
    }
  }

  if (lines.length < 2) {
    let pool: string[];
    if (dist >= 1100)        pool = PHRASES.finishDrive;
    else if (phase === 'start')   pool = PHRASES.start;
    else if (phase === 'early')   pool = PHRASES.earlyPosition;
    else if (phase === 'mid')     pool = [...PHRASES.midPosition, ...PHRASES.observation];
    else if (phase === 'bend')    pool = [...PHRASES.midPosition, ...PHRASES.stretchPosition];
    else                          pool = PHRASES.stretchPosition;

    const t = pickFresh(pool, seed + 100 + lines.length);
    lines.push(substitute(t, horses, snaps, vars));
  }

  if (lines.length < 2 && dist > 100 && dist < 1100 && (dist % 50 === 0)) {
    const t = pickFresh(PHRASES.observation, seed + 200);
    lines.push(substitute(t, horses, snaps, vars));
  }

  if (dist >= 1200) {
    const sumT  = pickFresh(PHRASES.summary, seed + 300);
    const sum2T = pickFresh(PHRASES.summary, seed + 400);
    lines.push(substitute(sumT,  horses, snaps, vars));
    lines.push(substitute(sum2T, horses, snaps, vars));
  }

  return lines.slice(0, 3);
}
