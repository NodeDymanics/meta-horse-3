// ============================================================
// Meta.Horse 2 — Horses Layer Component
// ============================================================
// Positions all 12 horses on the track from GmaxDataPoint array.

import type { Horse } from '../types/horse';
import type { GmaxDataPoint } from '../types/gmax';
import type { TrackGeometry } from '../types/track';
import { distanceToSvg } from '../core/coordinate-system';
import { RACE_DISTANCE } from '../simulation/phases';
import HorseSVG from './HorseSVG';

interface HorsesLayerProps {
  horses: Horse[];
  dataPoints: GmaxDataPoint[];
  track: TrackGeometry;
  elapsedTime: number;
}

export default function HorsesLayer({ horses, dataPoints, track, elapsedTime }: HorsesLayerProps) {
  return (
    <g className="horses-layer">
      {horses.map((horse, i) => {
        const dp = dataPoints[i];
        if (!dp) return null;

        // Convert Gmax P (remaining distance) back to distance traveled
        const distance = RACE_DISTANCE - dp.P;
        const pos = distanceToSvg(track, distance, horse.visual.lane);

        return (
          <HorseSVG
            key={horse.id}
            horse={horse}
            dataPoint={dp}
            svgX={pos.x}
            svgY={pos.y}
            tx={pos.tx}
            ty={pos.ty}
            elapsedTime={elapsedTime}
          />
        );
      })}
    </g>
  );
}
