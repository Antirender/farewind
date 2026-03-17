import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PriceTrendChart from '../components/charts/PriceTrendChart';
import HeatmapChart from '../components/charts/HeatmapChart';
import StatsBar from '../components/charts/StatsBar';
import RouteMap from '../components/map/RouteMap';
import Button from '../components/ui/Button';
import styles from './RouteInsights.module.css';

type Range = '7d' | '30d' | 'all';

export default function RouteInsights() {
  const { routeId } = useParams<{ routeId: string }>();
  const { getRoute, entries, routes } = useApp();
  const nav = useNavigate();
  const route = getRoute(routeId ?? '');
  const [range, setRange] = useState<Range>('all');

  const routeEntries = useMemo(() => {
    let list = entries.filter((e) => e.routeId === routeId);
    if (range !== 'all') {
      const days = range === '7d' ? 7 : 30;
      const cutoff = Date.now() - days * 86_400_000;
      list = list.filter((e) => new Date(e.date).getTime() >= cutoff);
    }
    return list;
  }, [entries, routeId, range]);

  if (!route) {
    return (
      <div className={styles.page}>
        <p style={{ color: 'var(--color-text-muted)' }}>Route not found.</p>
        <Button variant="ghost" onClick={() => nav('/')}>← Back</Button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <Button variant="ghost" size="sm" onClick={() => nav('/')}>← Back</Button>
        <div>
          <h1 className={styles.heading}>
            {route.origin} → {route.destination}
          </h1>
          <p className={styles.sub}>{route.provider} · {route.rideType}</p>
        </div>
      </div>

      {/* Route switcher */}
      <div className={styles.routeSwitcher}>
        {routes.map((r) => (
          <button
            key={r.id}
            className={`${styles.routeTab} ${r.id === routeId ? styles.routeTabActive : ''}`}
            onClick={() => nav(`/insights/${r.id}`)}
          >
            {r.origin.split(',')[0]} → {r.destination.split(',')[0]}
          </button>
        ))}
      </div>

      {/* Time range */}
      <div className={styles.rangeBar}>
        {(['7d', '30d', 'all'] as Range[]).map((r) => (
          <button
            key={r}
            className={`${styles.rangeBtn} ${range === r ? styles.rangeBtnActive : ''}`}
            onClick={() => setRange(r)}
          >
            {r === 'all' ? 'All' : r}
          </button>
        ))}
      </div>

      {/* Stats */}
      <StatsBar entries={routeEntries} />

      {/* Map */}
      <RouteMap route={route} />

      {/* Charts */}
      <PriceTrendChart entries={routeEntries} />
      <HeatmapChart entries={routeEntries} />
    </div>
  );
}
