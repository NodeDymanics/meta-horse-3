// ============================================================
// Meta.Horse 2 — Track Profile Registry
// ============================================================
// Defines track profiles: abstract (elliptical) and real racecourses.

import type { TrackProfile } from '../types/track';

// Ascot-area GPS center for abstract tracks
const ABSTRACT_GPS_CENTER = { lat: 51.4189, lng: -0.4058 };

export const ABSTRACT_TRACK: TrackProfile = {
  id: '999',
  name: 'Simulated Oval',
  distance: 1200,
  type: 'abstract',
  ellipse: { cx: 700, cy: 280, rx: 510, ry: 185 },
  gpsBounds: {
    center: ABSTRACT_GPS_CENTER,
    // At ~51.4° latitude:
    // 1 degree lat ≈ 111,320m
    // 1 degree lng ≈ 111,320 * cos(51.4°) ≈ 69,470m
    metersPerDegreeLat: 111320,
    metersPerDegreeLng: 69470,
  },
};

// Registry of available track profiles
const TRACK_REGISTRY: Map<string, TrackProfile> = new Map([
  [ABSTRACT_TRACK.id, ABSTRACT_TRACK],
]);

export function getTrackProfile(id: string): TrackProfile {
  return TRACK_REGISTRY.get(id) ?? ABSTRACT_TRACK;
}

export function getAllTrackProfiles(): TrackProfile[] {
  return Array.from(TRACK_REGISTRY.values());
}
