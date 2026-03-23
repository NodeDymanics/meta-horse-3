// ============================================================
// Meta.Horse 2 — Track View Component
// ============================================================
// Main SVG container with track surface and horses.

import { useMemo } from 'react';
import type { GmaxRaceRecord, GmaxDataPoint } from '../types/gmax';
import { getTrackGeometry, TRACK_CONFIG } from '../core/coordinate-system';
import TrackSurface from './TrackSurface';
import HorsesLayer from './HorsesLayer';

interface TrackViewProps {
  record: GmaxRaceRecord;
  dataPoints: GmaxDataPoint[];
  elapsedTime: number;
}

export default function TrackView({ record, dataPoints, elapsedTime }: TrackViewProps) {
  const track = useMemo(() => getTrackGeometry(), []);

  return (
    <svg
      viewBox={`0 0 ${TRACK_CONFIG.svgWidth} ${TRACK_CONFIG.svgHeight}`}
      className="track-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <TrackSurface track={track} />
      <HorsesLayer
        horses={record.horses}
        dataPoints={dataPoints}
        track={track}
        elapsedTime={elapsedTime}
      />
    </svg>
  );
}
