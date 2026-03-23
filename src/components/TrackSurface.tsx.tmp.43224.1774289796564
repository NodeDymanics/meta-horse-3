// ============================================================
// Meta.Horse 2 — Track Surface SVG Component
// ============================================================
// Renders the static track elements: surface, lanes, rails, markers.

import { memo } from 'react';
import type { TrackGeometry } from '../types/track';
import { TRACK_CONFIG } from '../core/coordinate-system';

const { cx, cy, rx, ry } = TRACK_CONFIG;

interface TrackSurfaceProps {
  track: TrackGeometry;
}

function TrackSurfaceInner({ track }: TrackSurfaceProps) {
  const distanceMarkers = [0, 200, 400, 600, 800, 1000, 1200];

  return (
    <g className="track-layer">
      {/* Background */}
      <rect x="0" y="0" width="1400" height="580" fill="#1a472a" rx="8" />

      {/* Infield (grass) */}
      <ellipse cx={cx} cy={cy} rx={rx - track.trackWidth / 2 - 8} ry={ry - track.trackWidth / 2 - 8}
        fill="#2d5a3a" />

      {/* Track surface */}
      <path d={track.outerPath} fill="#c4a46c" />
      <path d={track.innerPath} fill="#1a472a" />

      {/* Lane lines */}
      {Array.from({ length: 11 }, (_, i) => {
        const laneOffset = -track.trackWidth / 2 + track.laneWidth * (i + 1);
        const N = 200;
        let d = '';
        for (let j = 0; j <= N; j++) {
          const angle = Math.PI + (j / N) * 2 * Math.PI;
          const ex = cx + rx * Math.cos(angle);
          const ey = cy + ry * Math.sin(angle);
          const toCenterX = cx - ex;
          const toCenterY = cy - ey;
          const len = Math.sqrt(toCenterX ** 2 + toCenterY ** 2) || 1;
          const nx = -toCenterX / len;
          const ny = -toCenterY / len;
          const px = ex + nx * laneOffset;
          const py = ey + ny * laneOffset;
          d += j === 0 ? `M ${px.toFixed(1)} ${py.toFixed(1)}` : ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
        }
        d += ' Z';
        return (
          <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.5" strokeDasharray="4 8" />
        );
      })}

      {/* Inner rail */}
      <path d={track.innerPath} fill="none" stroke="#fff" strokeWidth="2.5" />

      {/* Outer rail */}
      <path d={track.outerPath} fill="none" stroke="#fff" strokeWidth="2.5" />

      {/* Start/Finish line */}
      <line
        x1={track.startLine.x1} y1={track.startLine.y1}
        x2={track.startLine.x2} y2={track.startLine.y2}
        stroke="#fff" strokeWidth="4" strokeDasharray="4 4"
      />

      {/* Distance markers on track center */}
      {distanceMarkers.map(dist => {
        const progress = dist / 1200;
        const idx = Math.min(Math.floor(progress * (track.points.length - 1)), track.points.length - 2);
        const pt = track.points[idx];
        if (!pt) return null;
        // Place markers on inner side
        const markerOffset = -track.trackWidth / 2 - 18;
        return (
          <g key={dist}>
            <circle
              cx={pt.x + pt.nx * markerOffset}
              cy={pt.y + pt.ny * markerOffset}
              r="10" fill="rgba(255,255,255,0.8)"
            />
            <text
              x={pt.x + pt.nx * markerOffset}
              y={pt.y + pt.ny * markerOffset + 1}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fontWeight="bold" fill="#1a472a"
            >
              {dist}
            </text>
          </g>
        );
      })}

      {/* Track info text */}
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="18" fill="rgba(255,255,255,0.3)"
        fontWeight="bold">META.HORSE</text>
      <text x={cx} y={cy + 15} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.2)">
        1200m — Simulated Oval
      </text>
    </g>
  );
}

const TrackSurface = memo(TrackSurfaceInner);
export default TrackSurface;
