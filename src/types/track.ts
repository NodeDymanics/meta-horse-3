// ============================================================
// Meta.Horse 2 — Track Type Definitions
// ============================================================

export interface TrackPoint {
  x: number;
  y: number;
  tx: number;
  ty: number;
  nx: number;
  ny: number;
  progress: number;
}

export interface TrackGeometry {
  points: TrackPoint[];
  innerPath: string;
  outerPath: string;
  centerPath: string;
  trackWidth: number;
  laneWidth: number;
  startLine: { x1: number; y1: number; x2: number; y2: number };
  center: { x: number; y: number };
}

export interface GpsBounds {
  center: { lat: number; lng: number };
  metersPerDegreeLat: number;
  metersPerDegreeLng: number;
}

export interface TrackProfile {
  id: string;
  name: string;
  distance: number;
  type: 'abstract' | 'real';
  ellipse?: { cx: number; cy: number; rx: number; ry: number };
  gpsWaypoints?: Array<{ lat: number; lng: number }>;
  gpsBounds: GpsBounds;
}

export type CameraMode = 'standard' | 'cinematic';

export interface CameraState {
  vx: number;
  vy: number;
  vw: number;
  vh: number;
  tvx: number;
  tvy: number;
  tvw: number;
  tvh: number;
  mode: CameraMode;
}

export interface ReplayState {
  checkpointIndex: number;
  alpha: number;
  isPlaying: boolean;
  speed: number;
  accumulator: number;
}
