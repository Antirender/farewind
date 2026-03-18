import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import styles from './RouteMapPage.module.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ROUTE_COLORS = [
  '#6366f1', '#22d3ee', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6',
];

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useMemo(() => {
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, bounds]);
  return null;
}

export default function RouteMapPage() {
  const { routes, entries } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const routeStats = useMemo(() => {
    const stats: Record<string, { count: number; avg: number; lastRide: string }> = {};
    for (const r of routes) {
      const re = entries.filter((e) => e.routeId === r.id);
      const count = re.length;
      const avg = count > 0 ? re.reduce((s, e) => s + e.price, 0) / count : 0;
      const lastRide =
        count > 0
          ? new Date(Math.max(...re.map((e) => new Date(e.date).getTime()))).toLocaleDateString(
              'en-CA',
              { month: 'short', day: 'numeric' },
            )
          : '—';
      stats[r.id] = { count, avg, lastRide };
    }
    return stats;
  }, [routes, entries]);

  const bounds = useMemo<L.LatLngBoundsExpression>(() => {
    const lats = routes.flatMap((r) => [r.originCoords[0], r.destCoords[0]]);
    const lngs = routes.flatMap((r) => [r.originCoords[1], r.destCoords[1]]);
    return [
      [Math.min(...lats) - 0.02, Math.min(...lngs) - 0.02],
      [Math.max(...lats) + 0.02, Math.max(...lngs) + 0.02],
    ];
  }, [routes]);

  const selected = routes.find((r) => r.id === selectedId);

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <h1 className={styles.heading}>Route Map</h1>
        <p className={styles.sub}>All your tracked routes on one map. Tap a route to highlight it.</p>

        <div className={styles.routeList}>
          {routes.map((r, i) => {
            const st = routeStats[r.id];
            const color = ROUTE_COLORS[i % ROUTE_COLORS.length];
            const isActive = selectedId === r.id;
            return (
              <button
                key={r.id}
                className={`${styles.routeItem} ${isActive ? styles.routeItemActive : ''}`}
                onClick={() => setSelectedId(isActive ? null : r.id)}
              >
                <span className={styles.routeColor} style={{ background: color }} />
                <div className={styles.routeInfo}>
                  <span className={styles.routeNick}>{r.name}</span>
                  <span className={styles.routeAddr}>{r.origin} → {r.destination}</span>
                  <div className={styles.routeMeta}>
                    <Badge color={st.count > 10 ? 'success' : 'neutral'} >
                      {`${st.count} rides`}
                    </Badge>
                    <span className={styles.routeAvg}>
                      avg ${st.avg.toFixed(2)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.mapArea}>
        <MapContainer
          center={[43.5, -79.6]}
          zoom={11}
          scrollWheelZoom
          className={styles.map}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds bounds={bounds} />

          {routes.map((r, i) => {
            const color = ROUTE_COLORS[i % ROUTE_COLORS.length];
            const isActive = selectedId === r.id || selectedId === null;
            const weight = selectedId === r.id ? 5 : 3;
            const opacity = isActive ? 0.9 : 0.15;
            return (
              <Polyline
                key={r.id}
                positions={[r.originCoords, r.destCoords]}
                pathOptions={{
                  color,
                  weight,
                  dashArray: selectedId === r.id ? undefined : '8 6',
                  opacity,
                }}
                eventHandlers={{ click: () => setSelectedId(r.id) }}
              />
            );
          })}

          {/* Unique markers (dedupe by coordinates) */}
          {(() => {
            const seen = new Set<string>();
            const markers: { pos: [number, number]; label: string }[] = [];
            for (const r of routes) {
              const oKey = r.originCoords.join(',');
              if (!seen.has(oKey)) {
                seen.add(oKey);
                markers.push({ pos: r.originCoords, label: r.origin });
              }
              const dKey = r.destCoords.join(',');
              if (!seen.has(dKey)) {
                seen.add(dKey);
                markers.push({ pos: r.destCoords, label: r.destination });
              }
            }
            return markers.map((m) => (
              <Marker key={m.pos.join(',')} position={m.pos}>
                <Popup>{m.label}</Popup>
              </Marker>
            ));
          })()}
        </MapContainer>

        {/* Selected route card overlay */}
        {selected && (
          <Card className={styles.overlay}>
            <div className={styles.overlayHeader}>
              <span className={styles.overlayNick}>{selected.name}</span>
              <button
                className={styles.overlayClose}
                onClick={() => setSelectedId(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className={styles.overlayAddr}>{selected.origin} → {selected.destination}</p>
            <div className={styles.overlayStats}>
              <div>
                <span className={styles.overlayStatLabel}>Rides</span>
                <span className={styles.overlayStatValue}>{routeStats[selected.id].count}</span>
              </div>
              <div>
                <span className={styles.overlayStatLabel}>Avg fare</span>
                <span className={styles.overlayStatValue}>${routeStats[selected.id].avg.toFixed(2)}</span>
              </div>
              <div>
                <span className={styles.overlayStatLabel}>Last ride</span>
                <span className={styles.overlayStatValue}>{routeStats[selected.id].lastRide}</span>
              </div>
            </div>
            <p className={styles.overlayProvider}>{selected.provider} · {selected.rideType}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
