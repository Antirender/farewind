import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PriceTrendChart from '../components/charts/PriceTrendChart';
import HeatmapChart from '../components/charts/HeatmapChart';
import StatsBar from '../components/charts/StatsBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import styles from './RouteInsights.module.css';

type Range = '7d' | '30d' | 'all';
type ViewMode = 'overview' | 'compare';

export default function RouteInsights() {
  const { routeId } = useParams<{ routeId: string }>();
  const { getRoute, entries, routes } = useApp();
  const nav = useNavigate();
  const route = getRoute(routeId ?? '');
  const [range, setRange] = useState<Range>('all');
  const [view, setView] = useState<ViewMode>('overview');

  const routeEntries = useMemo(() => {
    let list = entries.filter((e) => e.routeId === routeId);
    if (range !== 'all') {
      const days = range === '7d' ? 7 : 30;
      const cutoff = Date.now() - days * 86_400_000;
      list = list.filter((e) => new Date(e.date).getTime() >= cutoff);
    }
    return list;
  }, [entries, routeId, range]);

  const { weekdayEntries, weekendEntries, weekdayAvg, weekendAvg } = useMemo(() => {
    const wd = routeEntries.filter((e) => {
      const d = new Date(e.date).getDay();
      return d >= 1 && d <= 5;
    });
    const we = routeEntries.filter((e) => {
      const d = new Date(e.date).getDay();
      return d === 0 || d === 6;
    });
    return {
      weekdayEntries: wd,
      weekendEntries: we,
      weekdayAvg: wd.length > 0 ? wd.reduce((s, e) => s + e.price, 0) / wd.length : 0,
      weekendAvg: we.length > 0 ? we.reduce((s, e) => s + e.price, 0) / we.length : 0,
    };
  }, [routeEntries]);

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
          <h1 className={styles.heading}>{route.name}</h1>
          <p className={styles.sub}>
            {route.origin} → {route.destination}
          </p>
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
            {r.name}
          </button>
        ))}
      </div>

      {/* Controls row */}
      <div className={styles.controls}>
        {/* Time range */}
        <div className={styles.rangeBar}>
          {(['7d', '30d', 'all'] as Range[]).map((r) => (
            <button
              key={r}
              className={`${styles.rangeBtn} ${range === r ? styles.rangeBtnActive : ''}`}
              onClick={() => setRange(r)}
            >
              {r === 'all' ? 'All Time' : r === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>

        {/* View mode */}
        <div className={styles.rangeBar}>
          <button
            className={`${styles.rangeBtn} ${view === 'overview' ? styles.rangeBtnActive : ''}`}
            onClick={() => setView('overview')}
          >
            Overview
          </button>
          <button
            className={`${styles.rangeBtn} ${view === 'compare' ? styles.rangeBtnActive : ''}`}
            onClick={() => setView('compare')}
          >
            Weekday vs Weekend
          </button>
        </div>
      </div>

      {view === 'overview' ? (
        <>
          {/* Stats */}
          <section aria-label="Fare summary">
            <h3 className={styles.sectionLabel}>📊 Your Numbers</h3>
            <StatsBar entries={routeEntries} />
          </section>
          {/* Charts */}
          <section aria-label="Price over time">
            <h3 className={styles.sectionLabel}>📈 Price Over Time</h3>
            <PriceTrendChart entries={routeEntries} />
          </section>
          <section aria-label="When to ride">
            <h3 className={styles.sectionLabel}>🗓 When to Ride</h3>
            <HeatmapChart entries={routeEntries} />
          </section>
        </>
      ) : (
        <>
          {/* Comparison view */}
          <Card padding="sm">
            <div className={styles.compareHeader}>
              <h3 className={styles.compareTitle}>Weekday vs Weekend Comparison</h3>
              <p className={styles.compareSub}>
                How your fares differ between weekdays (Mon–Fri) and weekends (Sat–Sun).
              </p>
            </div>
            <div className={styles.compareGrid}>
              <div className={styles.compareColumn}>
                <span className={styles.compareLabel}>Weekday</span>
                <span className={styles.compareValue}>
                  {weekdayEntries.length > 0 ? `$${weekdayAvg.toFixed(2)}` : '—'}
                </span>
                <span className={styles.compareCount}>{weekdayEntries.length} rides</span>
              </div>
              <div className={styles.compareDivider}>
                {weekdayEntries.length > 0 && weekendEntries.length > 0 && (
                  <span
                    className={styles.compareDiff}
                    style={{
                      color:
                        weekdayAvg < weekendAvg
                          ? 'var(--color-success)'
                          : weekdayAvg > weekendAvg
                          ? 'var(--color-danger)'
                          : 'var(--color-text-muted)',
                    }}
                  >
                    {weekdayAvg < weekendAvg
                      ? `$${(weekendAvg - weekdayAvg).toFixed(2)} cheaper`
                      : weekdayAvg > weekendAvg
                      ? `$${(weekdayAvg - weekendAvg).toFixed(2)} more`
                      : 'Same price'}
                  </span>
                )}
                <span className={styles.compareVs}>vs</span>
              </div>
              <div className={styles.compareColumn}>
                <span className={styles.compareLabel}>Weekend</span>
                <span className={styles.compareValue}>
                  {weekendEntries.length > 0 ? `$${weekendAvg.toFixed(2)}` : '—'}
                </span>
                <span className={styles.compareCount}>{weekendEntries.length} rides</span>
              </div>
            </div>
          </Card>

          {/* Weekday chart */}
          {weekdayEntries.length > 0 && (
            <>
              <h4 className={styles.sectionLabel}>Weekday Rides (Mon–Fri)</h4>
              <StatsBar entries={weekdayEntries} />
              <PriceTrendChart entries={weekdayEntries} />
            </>
          )}

          {/* Weekend chart */}
          {weekendEntries.length > 0 && (
            <>
              <h4 className={styles.sectionLabel}>Weekend Rides (Sat–Sun)</h4>
              <StatsBar entries={weekendEntries} />
              <PriceTrendChart entries={weekendEntries} />
            </>
          )}
        </>
      )}
    </div>
  );
}
