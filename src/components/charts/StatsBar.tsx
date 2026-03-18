import { useMemo } from 'react';
import Card from '../ui/Card';
import type { RideEntry } from '../../types';
import styles from './StatsBar.module.css';

interface Props {
  entries: RideEntry[];
}

export default function StatsBar({ entries }: Props) {
  if (entries.length === 0) return null;

  const { avg, min, max, p25, p75, range } = useMemo(() => {
    const p = entries.map((e) => e.price).sort((a, b) => a - b);
    const a = p.reduce((s, pr) => s + pr, 0) / p.length;
    return {
      avg: a,
      min: p[0],
      max: p[p.length - 1],
      p25: p[Math.floor(p.length * 0.25)],
      p75: p[Math.floor(p.length * 0.75)],
      range: p[p.length - 1] - p[0],
    };
  }, [entries]);

  // Position indicator for where avg sits in min-max range
  const avgPos = range > 0 ? ((avg - min) / range) * 100 : 50;

  const stats = [
    { label: 'Average', value: `$${avg.toFixed(2)}`, color: 'var(--color-primary-light)' },
    { label: 'Lowest', value: `$${min.toFixed(2)}`, color: 'var(--color-success)' },
    { label: 'Highest', value: `$${max.toFixed(2)}`, color: 'var(--color-danger)' },
    { label: '25th %', value: `$${p25.toFixed(2)}`, color: 'var(--color-accent)' },
    { label: '75th %', value: `$${p75.toFixed(2)}`, color: 'var(--color-warning)' },
    { label: 'Rides', value: `${entries.length}`, color: 'var(--color-text-secondary)' },
  ];

  return (
    <Card padding="sm">
      <div className={styles.header}>
        <h3 className={styles.title}>How much are you actually paying?</h3>
        <p className={styles.desc}>
          Across {entries.length} ride{entries.length > 1 ? 's' : ''}, your fares range from ${min.toFixed(2)} to ${max.toFixed(2)} — a ${range.toFixed(2)} spread.
        </p>
      </div>

      {/* Mini range bar */}
      <div className={styles.rangeBar}>
        <div className={styles.rangeTrack}>
          <div
            className={styles.rangeFill}
            style={{
              left: `${range > 0 ? ((p25 - min) / range) * 100 : 25}%`,
              width: `${range > 0 ? ((p75 - p25) / range) * 100 : 50}%`,
            }}
          />
          <div
            className={styles.rangeMarker}
            style={{ left: `${avgPos}%` }}
            title={`Avg: $${avg.toFixed(2)}`}
          />
        </div>
        <div className={styles.rangeLabels}>
          <span>${min.toFixed(0)}</span>
          <span>avg ${avg.toFixed(0)}</span>
          <span>${max.toFixed(0)}</span>
        </div>
      </div>

      <div className={styles.grid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.stat}>
            <span className={styles.value} style={{ color: s.color }}>{s.value}</span>
            <span className={styles.label}>{s.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
