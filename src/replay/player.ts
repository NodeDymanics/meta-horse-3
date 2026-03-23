// ============================================================
// Meta.Horse 2 — Replay Player
// ============================================================
// Plays back a pre-recorded GmaxRaceRecord by interpolating
// between checkpoints. Does NOT re-simulate.

import type { GmaxDataPoint, GmaxRaceRecord, GmaxCheckpoint } from '../types/gmax';
import type { ReplayState } from '../types/track';
import { lerp } from '../core/rng';
import { raceTimestamp } from '../core/gmax-id';

const SECONDS_PER_CHECKPOINT = 0.6; // at 1× speed

export class ReplayPlayer {
  readonly record: GmaxRaceRecord;
  state: ReplayState;

  constructor(record: GmaxRaceRecord) {
    this.record = record;
    this.state = {
      checkpointIndex: 0,
      alpha: 0,
      isPlaying: false,
      speed: 1,
      accumulator: 0,
    };
  }

  get maxCheckpoint(): number {
    return this.record.checkpoints.length - 1;
  }

  get isFinished(): boolean {
    return this.state.checkpointIndex >= this.maxCheckpoint && this.state.alpha >= 1;
  }

  play(): void { this.state.isPlaying = true; }
  pause(): void { this.state.isPlaying = false; }

  setSpeed(speed: number): void { this.state.speed = speed; }

  seek(checkpointIndex: number): void {
    this.state.checkpointIndex = Math.max(0, Math.min(checkpointIndex, this.maxCheckpoint));
    this.state.alpha = 0;
    this.state.accumulator = 0;
  }

  stepForward(): void {
    if (this.state.checkpointIndex < this.maxCheckpoint) {
      this.state.checkpointIndex++;
      this.state.alpha = 0;
      this.state.accumulator = 0;
    }
  }

  stepBack(): void {
    if (this.state.checkpointIndex > 0) {
      this.state.checkpointIndex--;
      this.state.alpha = 0;
      this.state.accumulator = 0;
    }
  }

  restart(): void {
    this.state.checkpointIndex = 0;
    this.state.alpha = 0;
    this.state.accumulator = 0;
    this.state.isPlaying = true;
  }

  tick(dt: number): void {
    if (!this.state.isPlaying || this.isFinished) return;

    this.state.accumulator += dt * this.state.speed;
    const advanceTime = SECONDS_PER_CHECKPOINT;

    while (this.state.accumulator >= advanceTime && this.state.checkpointIndex < this.maxCheckpoint) {
      this.state.accumulator -= advanceTime;
      this.state.checkpointIndex++;
      this.state.alpha = 0;
    }

    if (this.state.checkpointIndex < this.maxCheckpoint) {
      this.state.alpha = Math.min(1, this.state.accumulator / advanceTime);
    } else {
      this.state.alpha = 1;
      this.state.isPlaying = false;
    }
  }

  getCurrentCheckpoint(): GmaxCheckpoint {
    return this.record.checkpoints[this.state.checkpointIndex];
  }

  getInterpolatedPositions(): GmaxDataPoint[] {
    const { checkpointIndex, alpha } = this.state;
    const cp0 = this.record.checkpoints[checkpointIndex];

    if (checkpointIndex >= this.maxCheckpoint || alpha === 0) {
      return cp0.horses;
    }

    const cp1 = this.record.checkpoints[checkpointIndex + 1];

    return cp0.horses.map((h0, i) => {
      const h1 = cp1.horses[i];

      // Interpolate timestamp
      const t0 = new Date(h0.T).getTime();
      const t1 = new Date(h1.T).getTime();
      const tInterp = new Date(t0 + (t1 - t0) * alpha);

      return {
        T:  tInterp.toISOString().replace(/Z$/, '').replace(/(\.\d)\d*$/, '$1') + 'Z',
        I:  h0.I,
        X:  lerp(h0.X, h1.X, alpha),
        Y:  lerp(h0.Y, h1.Y, alpha),
        V:  lerp(h0.V, h1.V, alpha),
        P:  lerp(h0.P, h1.P, alpha),
        SF: lerp(h0.SF, h1.SF, alpha),
      };
    });
  }

  /** Get race elapsed time at current playback position */
  getElapsedTime(): number {
    const { checkpointIndex, alpha } = this.state;
    const cp0 = this.record.checkpoints[checkpointIndex];
    if (checkpointIndex >= this.maxCheckpoint) return cp0.time;

    const cp1 = this.record.checkpoints[checkpointIndex + 1];
    return lerp(cp0.time, cp1.time, alpha);
  }
}
