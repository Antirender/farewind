/**
 * Fetch real road routing from OSRM demo server.
 * Returns polyline geometry, distance (m), and duration (s).
 */
export interface RouteResult {
  geometry: [number, number][]; // [lat, lng][]
  distance: number; // meters
  duration: number; // seconds
}

export async function fetchRoute(
  origin: [number, number],
  destination: [number, number],
): Promise<RouteResult | null> {
  // OSRM expects lng,lat order
  const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) return null;

    const route = data.routes[0];
    // GeoJSON coords are [lng, lat] — flip to [lat, lng] for Leaflet
    const geometry: [number, number][] = route.geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]],
    );
    return {
      geometry,
      distance: route.distance,
      duration: route.duration,
    };
  } catch {
    return null;
  }
}

/** Format meters as human-readable distance. */
export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

/** Format seconds as human-readable duration. */
export function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}
