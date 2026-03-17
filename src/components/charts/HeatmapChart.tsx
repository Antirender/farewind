import Card from '../ui/Card';
import type { RideEntry } from '../../types';
import styles from './HeatmapChart.module.css';

interface Props {
  entries: RideEntry[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function HeatmapChart({ entries }: Props) {
  // Build grid: [day][hour] → { total, count }
  const grid: Record<string, Record<number, { total: number; count: number }>> = {};
  for (const d of DAYS) {
    grid[d] = {};
    for (const h of HOURS) grid[d][h] = { total: 0, count: 0 };
  }

  for (const e of entries) {
    const dt = new Date(e.date);
    const day = DAYS[(dt.getDay() + 6) % 7]; // Mon=0
    const hr = dt.getHours();
    grid[day][hr].total += e.price;
    grid[day][hr].count += 1;
  }

  // Find min/max average for color scaling
  let min = Infinity;
  let max = -Infinity;
  for (const d of DAYS) {
    for (const h of HOURS) {
      if (grid[d][h].count > 0) {
        const avg = grid[d][h].total / grid[d][h].count;
        if (avg < min) min = avg;
        if (avg > max) max = avg;
      }
    }
  }

  const range = max - min || 1;

  function cellColor(avg: number) {
    const t = (avg - min) / range; // 0→1
    // green → yellow → red
    if (t < 0.5) {
      const r = Math.round(52 + (251 - 52) * (t * 2));
      const g = Math.round(211 - (211 - 191) * (t * 2));
      const b = Math.round(153 - (153 - 36) * (t * 2));
      return `rgb(${r},${g},${b})`;
    }
    const r = Math.round(251 - (251 - 248) * ((t - 0.5) * 2));
    const g = Math.round(191 - (191 - 113) * ((t - 0.5) * 2));
    const b = Math.round(36 + (113 - 36) * ((t - 0.5) * 2));
    return `rgb(${r},${g},${b})`;
  }

  return (
    <Card padding="sm">
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', padding: '0.5rem 0.5rem 0' }}>
        Price Heatmap (Day × Hour)
      </h3>
      <div className={styles.wrap}>
        <div className={styles.grid}>
          {/* Header row: hours */}
          <div className={styles.corner} />
          {HOURS.filter((h) => h % 3 === 0).map((h) => (
            <div key={`h-${h}`} className={styles.hourLabel} style={{ gridColumn: h + 2 }}>
              {h.toString().padStart(2, '0')}
            </div>
          ))}

          {DAYS.map((day) => (
            <div key={day} className={styles.row}>
              <div className={styles.dayLabel}>{day}</div>
              {HOURS.map((h) => {
                const c = grid[day][h];
                const avg = c.count > 0 ? c.total / c.count : 0;
                return (
                  <div
                    key={h}
                    className={styles.cell}
                    title={c.count > 0 ? `${day} ${h}:00 — $${avg.toFixed(2)} avg (${c.count} rides)` : `${day} ${h}:00 — no data`}
                    style={{
                      background: c.count > 0 ? cellColor(avg) : 'var(--color-surface-alt)',
                      opacity: c.count > 0 ? 1 : 0.3,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Low</span>
          <div className={styles.legendBar} />
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>High</span>
        </div>
      </div>
    </Card>
  );
}
