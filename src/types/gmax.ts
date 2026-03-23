// ============================================================
// Meta.Horse 2 — Gmax Point Data Feed Types
// ============================================================
// The Gmax format is the canonical data model for all horse state.

export interface GmaxDataPoint {
  /** ISO 8601 UTC timestamp, e.g. "2015-06-10T19:41:27.0Z" */
  T: string;
  /** Structured ID: racecourseId(3) + date(8) + startTime(6) + horseNumber(2) */
  I: string;
  /** Longitude (WGS-84) */
  X: number;
  /** Latitude (WGS-84) */
  Y: number;
  /** Speed in meters per second */
  V: number;
  /** Distance remaining to finish line in meters */
  P: number;
  /** Stride frequency in Hz */
  SF: number;
}

export type RaceEventType =
  | 'lead-change'
  | 'surge'
  | 'falter'
  | 'neck-and-neck'
  | 'breaking-away'
  | 'finish';

export interface RaceEvent {
  type: RaceEventType;
  horseIds: number[];
}

export interface GmaxCheckpoint {
  leaderDistance: number;
  time: number;
  timestamp: string;
  horses: GmaxDataPoint[];
  events: RaceEvent[];
  commentary: string[];
}

export interface GmaxRaceRecord {
  seed: string;
  raceId: string;
  horses: import('./horse').Horse[];
  checkpoints: GmaxCheckpoint[];
  winner: number;
  top3: number[];
  finishTimes: Map<number, number>;
}
