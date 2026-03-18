import { useState, useMemo, Fragment } from 'react';
import Card from '../ui/Card';
import type { RideEntry } from '../../types';
import styles from './HeatmapChart.module.css';

interface Props {
  entries: RideEntry[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function HeatmapChart({ entries }: Props) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ day: string; hour: number } | null>(null);

  const { grid, min, max } = useMemo(() => {
    const g: Record<string, Record<number, { total: number; count: number }>> = {};
    for (const d of DAYS) {
      g[d] = {};
      for (const h of HOURS) g[d][h] = { total: 0, count: 0 };
    }
    for (const e of entries) {
      const dt = new Date(e.date);
      const day = DAYS[(dt.getDay() + 6) % 7];
      const hr = dt.getHours();
      g[day][hr].total += e.price;
      g[day][hr].count += 1;
    }
    let mn = Infinity;
    let mx = -Infinity;
    for (const d of DAYS) {
      for (const h of HOURS) {
        if (g[d][h].count > 0) {
          const avg = g[d][h].total / g[d][h].count;
          if (avg < mn) mn = avg;
          if (avg > mx) mx = avg;
        }
      }
    }
    return { grid: g, min: mn, max: mx };
  }, [entries]);

  const range = max - min || 1;

  function cellColor(avg: number) {
    const t = (avg - min) / range;
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

  const peakCell = useMemo(() => {
    let best = { day: '', hour: 0, avg: -Infinity };
    for (const d of DAYS)
      for (const h of HOURS) {
        const c = grid[d][h];
        if (c.count > 0) {
          const avg = c.total / c.count;
          if (avg > best.avg) best = { day: d, hour: h, avg };
        }
      }
    return best;
  }, [grid]);

  const cheapCell = useMemo(() => {
    let best = { day: '', hour: 0, avg: Infinity };
    for (const d of DAYS)
      for (const h of HOURS) {
        const c = grid[d][h];
        if (c.count > 0) {
          const avg = c.total / c.count;
          if (avg < best.avg) best = { day: d, hour: h, avg };
        }
      }
    return best;
  }, [grid]);

  const hoverInfo = useMemo(() => {
    if (hoveredDay && hoveredHour !== null) {
      const c = grid[hoveredDay][hoveredHour];
      if (c.count > 0) {
        return { day: hoveredDay, hour: hoveredHour, avg: c.total / c.count, count: c.count };
      }
    }
    return null;
  }, [grid, hoveredDay, hoveredHour]);

  if (entries.length === 0) {
    return (
      <Card>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0' }}>
          No ride data to visualise
        </p>
      </Card>
    );
  }

  return (
    <Card padding="sm">
      <div className={styles.chartHeader}>
        <div>
          <h3 className={styles.chartTitle}>When is the cheapest time to ride?</h3>
          <p className={styles.chartDesc}>
            This grid shows your average fare for each day × hour slot. Green = cheap, red = expensive. Hover to explore, click to pin a cell.
          </p>
        </div>
        <div className={styles.annotations}>
          {cheapCell.day && (
            <span className={styles.annotationGood}>
              ↓ {cheapCell.day} {cheapCell.hour}:00 · ${cheapCell.avg.toFixed(2)}
            </span>
          )}
          {peakCell.day && (
            <span className={styles.annotationBad}>
              ↑ {peakCell.day} {peakCell.hour}:00 · ${peakCell.avg.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <div className={styles.wrap}>
        <div
          className={styles.grid}
          onMouseLeave={() => {
            setHoveredDay(null);
            setHoveredHour(null);
          }}
        >
          {/* Corner */}
          <div className={styles.corner} />
          {/* Hour labels */}
          {HOURS.map((h) => (
            <div
              key={`h-${h}`}
              className={`${styles.hourLabel} ${hoveredHour === h ? styles.labelHL : ''}`}
            >
              {h % 3 === 0 ? h.toString().padStart(2, '0') : ''}
            </div>
          ))}

          {/* Day rows */}
          {DAYS.map((day) => (
            <Fragment key={day}>
              <div className={`${styles.dayLabel} ${hoveredDay === day ? styles.labelHL : ''}`}>
                {day}
              </div>
              {HOURS.map((h) => {
                const c = grid[day][h];
                const avg = c.count > 0 ? c.total / c.count : 0;
                const hasData = c.count > 0;
                const isRowHL = hoveredDay === day;
                const isColHL = hoveredHour === h;
                const isSelected =
                  selectedCell?.day === day && selectedCell?.hour === h;
                return (
                  <div
                    key={h}
                    className={[
                      styles.cell,
                      hasData ? '' : styles.cellEmpty,
                      (isRowHL || isColHL) && hasData ? styles.cellHL : '',
                      isSelected ? styles.cellSelected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onMouseEnter={() => {
                      setHoveredDay(day);
                      setHoveredHour(h);
                    }}
                    onClick={() => {
                      if (!hasData) return;
                      setSelectedCell(
                        isSelected ? null : { day, hour: h },
                      );
                    }}
                    style={{
                      background: hasData ? cellColor(avg) : undefined,
                    }}
                    role="gridcell"
                    aria-label={
                      hasData
                        ? `${day} ${h}:00 — $${avg.toFixed(2)} avg, ${c.count} rides`
                        : `${day} ${h}:00 — no data`
                    }
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Hover / selection info bar */}
      <div className={styles.infoBar}>
        {hoverInfo ? (
          <>
            <span className={styles.infoLabel}>
              {hoverInfo.day} {hoverInfo.hour.toString().padStart(2, '0')}:00
            </span>
            <span className={styles.infoValue}>${hoverInfo.avg.toFixed(2)} avg</span>
            <span className={styles.infoMeta}>
              {hoverInfo.count} ride{hoverInfo.count > 1 ? 's' : ''}
            </span>
          </>
        ) : selectedCell && grid[selectedCell.day][selectedCell.hour].count > 0 ? (
          <>
            <span className={styles.infoLabel}>
              📌 {selectedCell.day} {selectedCell.hour.toString().padStart(2, '0')}:00
            </span>
            <span className={styles.infoValue}>
              ${(grid[selectedCell.day][selectedCell.hour].total / grid[selectedCell.day][selectedCell.hour].count).toFixed(2)} avg
            </span>
            <span className={styles.infoMeta}>
              {grid[selectedCell.day][selectedCell.hour].count} ride{grid[selectedCell.day][selectedCell.hour].count > 1 ? 's' : ''}
            </span>
          </>
        ) : (
          <span className={styles.infoMeta}>Hover over a cell to see price details</span>
        )}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendRow}>
          <span className={styles.legendLabel}>
            ${min === Infinity ? '—' : min.toFixed(2)}
          </span>
          <div className={styles.legendSwatches}>
            <div className={styles.legendSwatch} style={{ background: 'rgb(52,211,153)' }} />
            <div className={styles.legendSwatch} style={{ background: 'rgb(152,201,95)' }} />
            <div className={styles.legendSwatch} style={{ background: 'rgb(251,191,36)' }} />
            <div className={styles.legendSwatch} style={{ background: 'rgb(250,152,75)' }} />
            <div className={styles.legendSwatch} style={{ background: 'rgb(248,113,113)' }} />
          </div>
          <span className={styles.legendLabel}>
            ${max === -Infinity ? '—' : max.toFixed(2)}
          </span>
        </div>
        <div className={styles.legendLabels}>
          <span>Cheapest</span>
          <span>Most expensive</span>
        </div>
      </div>

      {/* Annotation footer */}
      <div className={styles.chartFooter}>
        <p className={styles.chartFooterText}>
          {cheapCell.day && peakCell.day
            ? `Your cheapest window is ${cheapCell.day} around ${cheapCell.hour}:00 ($${cheapCell.avg.toFixed(2)} avg). Avoid ${peakCell.day} ${peakCell.hour}:00 when fares peak at $${peakCell.avg.toFixed(2)}.`
            : 'Log more rides to reveal pricing patterns across the week.'}
        </p>
        <p className={styles.chartFooterHint}>
          Grey cells = no ride data yet for that time slot.
        </p>
      </div>
    </Card>
  );
}
