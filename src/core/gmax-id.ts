// ============================================================
// Meta.Horse 2 — Gmax Race ID Encoding/Decoding
// ============================================================
// Format: CCCYYYYMMDDHHMMSSNN
//   CCC      = 3-digit racecourse code (999 = simulated)
//   YYYYMMDD = race date
//   HHMMSS   = scheduled start time (UTC)
//   NN       = 2-digit horse number (01-12)

import { hashSeed } from './rng';

export interface GmaxIdComponents {
  racecourseId: string;
  date: Date;
  startTime: Date;
  horseNumber: number;
}

function pad(n: number, len: number): string {
  return String(n).padStart(len, '0');
}

export function encodeGmaxId(
  racecourseId: string,
  date: Date,
  horseNumber: number,
): string {
  const course = racecourseId.padStart(3, '0').slice(0, 3);
  const y = pad(date.getUTCFullYear(), 4);
  const m = pad(date.getUTCMonth() + 1, 2);
  const d = pad(date.getUTCDate(), 2);
  const hh = pad(date.getUTCHours(), 2);
  const mm = pad(date.getUTCMinutes(), 2);
  const ss = pad(date.getUTCSeconds(), 2);
  const hn = pad(horseNumber, 2);
  return `${course}${y}${m}${d}${hh}${mm}${ss}${hn}`;
}

export function decodeGmaxId(id: string): GmaxIdComponents {
  const racecourseId = id.slice(0, 3);
  const year = parseInt(id.slice(3, 7), 10);
  const month = parseInt(id.slice(7, 9), 10) - 1;
  const day = parseInt(id.slice(9, 11), 10);
  const hour = parseInt(id.slice(11, 13), 10);
  const minute = parseInt(id.slice(13, 15), 10);
  const second = parseInt(id.slice(15, 17), 10);
  const horseNumber = parseInt(id.slice(17, 19), 10);

  const date = new Date(Date.UTC(year, month, day, hour, minute, second));

  return { racecourseId, date, startTime: date, horseNumber };
}

/**
 * Derive a deterministic race date/time from a seed string.
 * Returns a Date in a reasonable range for simulation races.
 */
export function deriveRaceDateTime(seed: string): Date {
  const h = hashSeed(seed);
  // Generate a date between 2020-01-01 and 2025-12-31
  const baseMs = Date.UTC(2020, 0, 1);
  const rangeMs = 6 * 365.25 * 24 * 60 * 60 * 1000;
  const dateMs = baseMs + (h % rangeMs);

  const date = new Date(dateMs);
  // Snap to common race start times (14:00-17:00 UTC)
  const hour = 14 + ((h >>> 16) % 4);
  const minute = ((h >>> 8) % 4) * 15; // 0, 15, 30, 45
  date.setUTCHours(hour, minute, 0, 0);
  return date;
}

/**
 * Build a race timestamp string from base time + elapsed seconds.
 */
export function raceTimestamp(baseTime: Date, elapsedSeconds: number): string {
  const ms = baseTime.getTime() + elapsedSeconds * 1000;
  return new Date(ms).toISOString().replace(/Z$/, '').replace(/(\.\d)\d*$/, '$1') + 'Z';
}
