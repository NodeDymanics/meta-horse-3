// ============================================================
// Meta.Horse 2 — Standings Panel
// ============================================================

import type { GmaxRaceRecord, GmaxDataPoint } from '../types/gmax';
import { RACE_DISTANCE } from '../simulation/phases';

interface StandingsPanelProps {
  record: GmaxRaceRecord;
  dataPoints: GmaxDataPoint[];
}

export default function StandingsPanel({ record, dataPoints }: StandingsPanelProps) {
  if (!dataPoints.length) return null;

  // Sort by remaining distance (P ascending = further ahead)
  const sorted = dataPoints
    .map((dp, i) => ({ dp, horse: record.horses[i] }))
    .sort((a, b) => a.dp.P - b.dp.P);

  return (
    <div className="panel standings-panel">
      <h3>POSITIONS</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Horse</th>
            <th>Speed</th>
            <th>SF</th>
            <th>Rem</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ dp, horse }, rank) => (
            <tr key={horse.id}>
              <td className="rank">{rank + 1}</td>
              <td className="horse-name">
                <span className="color-dot" style={{ background: horse.visual.bodyColor }} />
                <span className="saddle-num">{horse.number}</span>
                {horse.name}
              </td>
              <td>{dp.V.toFixed(1)}</td>
              <td>{dp.SF.toFixed(2)}</td>
              <td>{dp.P.toFixed(0)}m</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
