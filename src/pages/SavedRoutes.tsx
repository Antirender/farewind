import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import styles from './SavedRoutes.module.css';

export default function SavedRoutes() {
  const { routes, entries } = useApp();
  const nav = useNavigate();

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Your Routes</h1>
      <p className={styles.sub}>Tap a route to explore price insights.</p>

      <div className={styles.grid}>
        {routes.map((r) => {
          const rideEntries = entries.filter((e) => e.routeId === r.id);
          const count = rideEntries.length;
          const avg =
            count > 0
              ? rideEntries.reduce((s, e) => s + e.price, 0) / count
              : 0;
          const lastRide = count > 0
            ? new Date(
                Math.max(...rideEntries.map((e) => new Date(e.date).getTime())),
              ).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
            : 'No rides';

          return (
            <Card
              key={r.id}
              clickable
              onClick={() => nav(`/insights/${r.id}`)}
              className={styles.card}
            >
              <div className={styles.cardHeader}>
                <span className={styles.routeNick}>{r.name}</span>
              </div>
              <p className={styles.routeAddr}>
                {r.origin} → {r.destination}
              </p>

              <div className={styles.meta}>
                <Badge color={count > 10 ? 'success' : count > 0 ? 'primary' : 'neutral'}>
                  {`${count} ride${count !== 1 ? 's' : ''}`}
                </Badge>
                <span className={styles.metaText}>{r.provider}</span>
              </div>

              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Avg price</span>
                  <span className={styles.statValue}>
                    {count > 0 ? `$${avg.toFixed(2)}` : '—'}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Last ride</span>
                  <span className={styles.statValue}>{lastRide}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
