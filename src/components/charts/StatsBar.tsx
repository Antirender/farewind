import Card from '../ui/Card';
import type { RideEntry } from '../../types';
import styles from './StatsBar.module.css';

interface Props {
  entries: RideEntry[];
}

export default function StatsBar({ entries }: Props) {
  if (entries.length === 0) return null;

  const prices = entries.map((e) => e.price).sort((a, b) => a - b);
  const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
  const min = prices[0];
  const max = prices[prices.length - 1];
  const p25 = prices[Math.floor(prices.length * 0.25)];
  const p75 = prices[Math.floor(prices.length * 0.75)];

  const stats = [
    { label: 'Avg', value: `$${avg.toFixed(2)}`, color: 'var(--color-primary-light)' },
    { label: 'Min', value: `$${min.toFixed(2)}`, color: 'var(--color-success)' },
    { label: 'Max', value: `$${max.toFixed(2)}`, color: 'var(--color-danger)' },
    { label: 'P25', value: `$${p25.toFixed(2)}`, color: 'var(--color-accent)' },
    { label: 'P75', value: `$${p75.toFixed(2)}`, color: 'var(--color-warning)' },
    { label: 'Rides', value: `${entries.length}`, color: 'var(--color-text-secondary)' },
  ];

  return (
    <Card padding="sm">
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
