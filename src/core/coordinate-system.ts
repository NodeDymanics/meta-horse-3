// ============================================================
// Meta.Horse 2 — Coordinate System
// ============================================================
// Bidirectional mapping between three coordinate spaces:
//   1. Race distance (0-1200m)
//   2. SVG coordinates (1400×580 canvas)
//   3. GPS coordinates (WGS-84 lat/lng)

import type { TrackGeometry, TrackPoint, TrackProfile } from '../types/track';

// --------------- Track Parameters ---------------
export const TRACK_CONFIG = {
  svgWidth:  1400,
  svgHeight: 580,
  cx: 700,
  cy: 280,
  rx: 510,
  ry: 185,
  trackWidth: 84,
  LOOKUP_N: 4000,
};

const { cx, cy, rx, ry, trackWidth, LOOKUP_N } = TRACK_CONFIG;
const laneWidth = trackWidth / 12;
const halfTrack = trackWidth / 2;
const START_ANGLE = Math.PI;

function ellipsePoint(angle: number): { x: number; y: number } {
  return {
    x: cx + rx * Math.cos(angle),
    y: cy + ry * Math.sin(angle),
  };
}

// --------------- Lookup Table ---------------
function buildLookupTable(): TrackPoint[] {
  const N = LOOKUP_N;
  type RawPoint = { x: number; y: number; angle: number; cumArcLen: number };
  const raw: RawPoint[] = [];
  let cumLen = 0;

  for (let i = 0; i <= N; i++) {
    const t     = i / N;
    const angle = START_ANGLE + t * 2 * Math.PI;
    const { x, y } = ellipsePoint(angle);

    if (i > 0) {
      const dx = x - raw[i - 1].x;
      const dy = y - raw[i - 1].y;
      cumLen += Math.sqrt(dx * dx + dy * dy);
    }

    raw.push({ x, y, angle, cumArcLen: cumLen });
  }

  const totalArcLen = cumLen;
  const table: TrackPoint[] = [];
  let rawIdx = 0;

  for (let i = 0; i <= N; i++) {
    const targetLen = (i / N) * totalArcLen;

    while (rawIdx < raw.length - 1 && raw[rawIdx + 1].cumArcLen < targetLen) {
      rawIdx++;
    }

    const r0 = raw[rawIdx];
    const r1 = raw[Math.min(rawIdx + 1, raw.length - 1)];
    const span = r1.cumArcLen - r0.cumArcLen;
    const alpha = span > 1e-9 ? (targetLen - r0.cumArcLen) / span : 0;

    const x = r0.x + alpha * (r1.x - r0.x);
    const y = r0.y + alpha * (r1.y - r0.y);

    const fwd = raw[Math.min(rawIdx + 1, raw.length - 1)];
    const bwd = raw[Math.max(rawIdx - 1, 0)];
    const tdx = fwd.x - bwd.x;
    const tdy = fwd.y - bwd.y;
    const tLen = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
    const tx_ = tdx / tLen;
    const ty_ = tdy / tLen;

    const toCenterX = cx - x;
    const toCenterY = cy - y;
    const toCenterLen = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY) || 1;
    const nx_ = -toCenterX / toCenterLen;
    const ny_ = -toCenterY / toCenterLen;

    table.push({ x, y, tx: tx_, ty: ty_, nx: nx_, ny: ny_, progress: i / N });
  }

  return table;
}

// --------------- SVG Path Building ---------------
function buildEllipsePath(offsetDist: number): string {
  const N = 200;
  let d = '';

  for (let i = 0; i <= N; i++) {
    const angle = START_ANGLE + (i / N) * 2 * Math.PI;
    const ex = cx + rx * Math.cos(angle);
    const ey = cy + ry * Math.sin(angle);

    const toCenterX = cx - ex;
    const toCenterY = cy - ey;
    const len = Math.sqrt(toCenterX ** 2 + toCenterY ** 2) || 1;
    const outwardNx = -toCenterX / len;
    const outwardNy = -toCenterY / len;

    const px = ex + outwardNx * offsetDist;
    const py = ey + outwardNy * offsetDist;

    if (i === 0) {
      d += `M ${px.toFixed(2)} ${py.toFixed(2)}`;
    } else {
      d += ` L ${px.toFixed(2)} ${py.toFixed(2)}`;
    }
  }
  d += ' Z';
  return d;
}

// --------------- Track Geometry Builder ---------------
export function buildTrackGeometry(): TrackGeometry {
  const points = buildLookupTable();

  const innerPath  = buildEllipsePath(-halfTrack);
  const outerPath  = buildEllipsePath(+halfTrack);
  const centerPath = buildEllipsePath(0);

  const startPt = ellipsePoint(START_ANGLE);
  const toCenterX = cx - startPt.x;
  const toCenterY = cy - startPt.y;
  const len = Math.sqrt(toCenterX ** 2 + toCenterY ** 2) || 1;
  const outNx = -toCenterX / len;
  const outNy = -toCenterY / len;

  const startLine = {
    x1: startPt.x + outNx * (-halfTrack - 5),
    y1: startPt.y + outNy * (-halfTrack - 5),
    x2: startPt.x + outNx * (halfTrack + 5),
    y2: startPt.y + outNy * (halfTrack + 5),
  };

  return {
    points, innerPath, outerPath, centerPath,
    trackWidth, laneWidth, startLine,
    center: { x: cx, y: cy },
  };
}

let _trackGeometry: TrackGeometry | null = null;

export function getTrackGeometry(): TrackGeometry {
  if (!_trackGeometry) {
    _trackGeometry = buildTrackGeometry();
  }
  return _trackGeometry;
}

// --------------- Distance → SVG Position ---------------
export function distanceToSvg(
  track: TrackGeometry,
  distance: number,
  lane: number,
): { x: number; y: number; tx: number; ty: number } {
  const progress = Math.min(distance / 1200, 1);
  const idx = Math.min(
    Math.floor(progress * (track.points.length - 1)),
    track.points.length - 2,
  );
  const alpha = progress * (track.points.length - 1) - idx;
  const p0 = track.points[idx];
  const p1 = track.points[idx + 1];

  const x = p0.x + alpha * (p1.x - p0.x);
  const y = p0.y + alpha * (p1.y - p0.y);
  const tx = p0.tx + alpha * (p1.tx - p0.tx);
  const ty = p0.ty + alpha * (p1.ty - p0.ty);

  const laneOffset = -halfTrack + laneWidth * lane + laneWidth / 2;
  const nx = p0.nx + alpha * (p1.nx - p0.nx);
  const ny = p0.ny + alpha * (p1.ny - p0.ny);
  const nLen = Math.sqrt(nx * nx + ny * ny) || 1;

  return {
    x: x + (nx / nLen) * laneOffset,
    y: y + (ny / nLen) * laneOffset,
    tx, ty,
  };
}

// --------------- SVG ↔ GPS Mapping ---------------
// For abstract tracks: SVG pixel offsets are converted to GPS using
// the track profile's GPS center and local meters-per-degree scaling.
// SVG pixels are mapped to meters using the track's total arc length
// vs the SVG perimeter.

// We need to know the SVG perimeter to compute pixels-per-meter
let _svgPerimeter: number | null = null;

function getSvgPerimeter(track: TrackGeometry): number {
  if (_svgPerimeter !== null) return _svgPerimeter;
  let total = 0;
  for (let i = 1; i < track.points.length; i++) {
    const dx = track.points[i].x - track.points[i - 1].x;
    const dy = track.points[i].y - track.points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  _svgPerimeter = total;
  return total;
}

export function svgToGps(
  svgX: number,
  svgY: number,
  track: TrackGeometry,
  profile: TrackProfile,
): { lat: number; lng: number } {
  const svgPerimeter = getSvgPerimeter(track);
  const pixelsPerMeter = svgPerimeter / profile.distance;

  // Offset from SVG center in pixels
  const dxPx = svgX - track.center.x;
  const dyPx = svgY - track.center.y;

  // Convert to meters
  const dxM = dxPx / pixelsPerMeter;
  const dyM = dyPx / pixelsPerMeter;

  // Convert to GPS offset (note: SVG y-down, GPS y-up → negate dy)
  const dLng = dxM / profile.gpsBounds.metersPerDegreeLng;
  const dLat = -dyM / profile.gpsBounds.metersPerDegreeLat;

  return {
    lat: profile.gpsBounds.center.lat + dLat,
    lng: profile.gpsBounds.center.lng + dLng,
  };
}

export function distanceToGps(
  distance: number,
  lane: number,
  track: TrackGeometry,
  profile: TrackProfile,
): { lat: number; lng: number } {
  const { x, y } = distanceToSvg(track, distance, lane);
  return svgToGps(x, y, track, profile);
}

export function gpsToSvg(
  lat: number,
  lng: number,
  track: TrackGeometry,
  profile: TrackProfile,
): { x: number; y: number } {
  const svgPerimeter = getSvgPerimeter(track);
  const pixelsPerMeter = svgPerimeter / profile.distance;

  const dLat = lat - profile.gpsBounds.center.lat;
  const dLng = lng - profile.gpsBounds.center.lng;

  const dyM = -dLat * profile.gpsBounds.metersPerDegreeLat;
  const dxM = dLng * profile.gpsBounds.metersPerDegreeLng;

  return {
    x: track.center.x + dxM * pixelsPerMeter,
    y: track.center.y + dyM * pixelsPerMeter,
  };
}
