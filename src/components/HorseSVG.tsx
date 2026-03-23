// ============================================================
// Meta.Horse 2 — Horse SVG Component
// ============================================================
// Renders a single horse with stride-frequency-animated legs.

import { memo, useMemo } from 'react';
import type { Horse } from '../types/horse';
import type { GmaxDataPoint } from '../types/gmax';

interface HorseSVGProps {
  horse: Horse;
  dataPoint: GmaxDataPoint;
  svgX: number;
  svgY: number;
  tx: number;
  ty: number;
  elapsedTime: number;
}

function HorseSVGInner({ horse, dataPoint, svgX, svgY, tx, ty, elapsedTime }: HorseSVGProps) {
  const { bodyColor, maneColor, saddleColor, numberColor } = horse.visual;
  const sf = dataPoint.SF;

  // Rotation angle from tangent direction
  const angle = Math.atan2(ty, tx) * (180 / Math.PI);

  // Stride-animated leg positions
  // Diagonal pairing: front-left/back-right move together, front-right/back-left together
  const legPhase1 = Math.sin(2 * Math.PI * sf * elapsedTime) * 3;
  const legPhase2 = Math.sin(2 * Math.PI * sf * elapsedTime + Math.PI) * 3;

  // Scale leg amplitude with speed (wider swing at higher speed)
  const speedFactor = Math.min(1, dataPoint.V / 16);
  const amp1 = legPhase1 * speedFactor;
  const amp2 = legPhase2 * speedFactor;

  // Counter-rotation for label readability
  const labelAngle = -angle;

  return (
    <g transform={`translate(${svgX.toFixed(1)}, ${svgY.toFixed(1)}) rotate(${angle.toFixed(1)})`}>
      {/* Shadow */}
      <ellipse cx="0" cy="3" rx="10" ry="3" fill="rgba(0,0,0,0.3)" />

      {/* Legs — animated with stride frequency */}
      {/* Front-left */}
      <line x1="-4" y1="2" x2={-4 + amp1} y2="7" stroke="#3a2a1a" strokeWidth="1.2" strokeLinecap="round" />
      {/* Front-right */}
      <line x1="-4" y1="-2" x2={-4 + amp2} y2="-7" stroke="#3a2a1a" strokeWidth="1.2" strokeLinecap="round" />
      {/* Back-left */}
      <line x1="4" y1="2" x2={4 + amp2} y2="7" stroke="#3a2a1a" strokeWidth="1.2" strokeLinecap="round" />
      {/* Back-right */}
      <line x1="4" y1="-2" x2={4 + amp1} y2="-7" stroke="#3a2a1a" strokeWidth="1.2" strokeLinecap="round" />

      {/* Body */}
      <ellipse cx="0" cy="0" rx="9" ry="4" fill={bodyColor} />

      {/* Neck connector */}
      <ellipse cx="-6" cy="0" rx="4" ry="3" fill={bodyColor} />

      {/* Head */}
      <circle cx="-10" cy="0" r="3" fill={bodyColor} />

      {/* Mane */}
      <ellipse cx="-5" cy="-2" rx="4" ry="1.5" fill={maneColor} />

      {/* Tail */}
      <path d={`M 9,0 Q 14,${amp1 * 0.5} 16,${amp1 * 0.3}`}
        fill="none" stroke={maneColor} strokeWidth="1.5" strokeLinecap="round" />

      {/* Saddle cloth with number */}
      <rect x="-3" y="-3" width="6" height="6" rx="1" fill={saddleColor} />
      <text x="0" y="0.5" textAnchor="middle" dominantBaseline="middle"
        fontSize="4.5" fontWeight="bold" fill={numberColor}>
        {horse.number}
      </text>

      {/* Name label (counter-rotated for readability) */}
      <g transform={`rotate(${labelAngle.toFixed(1)})`}>
        <rect x="-18" y="-14" width="36" height="8" rx="2" fill="rgba(0,0,0,0.6)" />
        <text x="0" y="-9.5" textAnchor="middle" dominantBaseline="middle"
          fontSize="5" fill="#fff" fontWeight="bold">
          {horse.name.length > 12 ? horse.name.slice(0, 12) + '…' : horse.name}
        </text>
      </g>
    </g>
  );
}

const HorseSVG = memo(HorseSVGInner);
export default HorseSVG;
