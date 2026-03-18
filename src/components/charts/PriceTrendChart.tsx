import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Brush,
  ReferenceLine,
  Legend,
} from 'recharts';
import type { RideEntry } from '../../types';
import Card from '../ui/Card';

interface Props {
  entries: RideEntry[];
}

export default function PriceTrendChart({ entries }: Props) {
  const [showSurge, setShowSurge] = useState(false);

  const { data, avg, maxSurge } = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const d = sorted.map((e) => {
      const dt = new Date(e.date);
      return {
        date: dt.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
        fullDate: dt.toLocaleDateString('en-CA', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
        price: e.price,
        surge: e.surgeMultiplier ?? 1,
        hasSurge: (e.surgeMultiplier ?? 1) > 1,
      };
    });
    const a = d.length > 0 ? d.reduce((s, p) => s + p.price, 0) / d.length : 0;
    const ms = d.length > 0 ? Math.max(...d.map((p) => p.surge)) : 1;
    return { data: d, avg: a, maxSurge: ms };
  }, [entries]);

  if (data.length === 0) {
    return (
      <Card>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0' }}>
          No data yet
        </p>
      </Card>
    );
  }

  const surgeCount = data.filter((d) => d.hasSurge).length;
  const pctSurge = ((surgeCount / data.length) * 100).toFixed(0);

  return (
    <Card padding="sm">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.75rem 0.75rem 0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.125rem' }}>
            Price Trend
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            Fare over time. Drag the brush below to zoom into a date range.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-primary-light)' }}>
            avg ${avg.toFixed(2)}
          </span>
          {surgeCount > 0 && (
            <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-warning)' }}>
              {pctSurge}% surged
            </span>
          )}
          <button
            onClick={() => setShowSurge(!showSurge)}
            style={{
              padding: '0.25rem 0.625rem',
              borderRadius: '100px',
              border: `1px solid ${showSurge ? 'var(--color-warning)' : 'var(--color-border)'}`,
              background: showSurge ? 'var(--color-warning-bg)' : 'transparent',
              color: showSurge ? 'var(--color-warning)' : 'var(--color-text-muted)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {showSurge ? '⚡ Surge On' : 'Show Surge'}
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="gradPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradSurge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis
            yAxisId="price"
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
            tickFormatter={(v: number) => `$${v}`}
            axisLine={{ stroke: 'var(--color-border)' }}
            label={{
              value: 'Fare (CAD)',
              angle: -90,
              position: 'insideLeft',
              offset: 20,
              style: { fontSize: 10, fill: 'var(--color-text-muted)' },
            }}
          />
          {showSurge && (
            <YAxis
              yAxisId="surge"
              orientation="right"
              domain={[1, Math.ceil(maxSurge * 10) / 10 + 0.2]}
              tick={{ fontSize: 10, fill: 'var(--color-warning)' }}
              tickFormatter={(v: number) => `${v.toFixed(1)}×`}
              axisLine={{ stroke: '#fbbf24' }}
              label={{
                value: 'Surge',
                angle: 90,
                position: 'insideRight',
                offset: 15,
                style: { fontSize: 10, fill: '#fbbf24' },
              }}
            />
          )}
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              boxShadow: 'var(--shadow-lg)',
            }}
            labelFormatter={(_, payload) => {
              if (payload && payload[0]) return payload[0].payload.fullDate;
              return '';
            }}
            formatter={(v: number, name: string) => {
              if (name === 'price') return [`$${v.toFixed(2)}`, 'Fare'];
              if (name === 'surge') return [`${v.toFixed(2)}×`, 'Surge'];
              return [v, name];
            }}
          />
          {showSurge && <Legend verticalAlign="top" height={24} />}
          <ReferenceLine
            yAxisId="price"
            y={avg}
            stroke="var(--color-primary-light)"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
            label={{
              value: `avg $${avg.toFixed(2)}`,
              position: 'right',
              style: { fontSize: 9, fill: 'var(--color-primary-light)' },
            }}
          />
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="price"
            name="price"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#gradPrice)"
            dot={(props: Record<string, unknown>) => {
              const { cx, cy, payload } = props as { cx: number; cy: number; payload: { hasSurge: boolean } };
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={payload.hasSurge ? 4 : 3}
                  fill={payload.hasSurge ? '#fbbf24' : 'var(--color-primary)'}
                  stroke={payload.hasSurge ? '#fbbf24' : 'var(--color-primary)'}
                  strokeWidth={1}
                />
              );
            }}
            activeDot={{ r: 5, stroke: 'var(--color-primary-light)', strokeWidth: 2 }}
          />
          {showSurge && (
            <Area
              yAxisId="surge"
              type="stepAfter"
              dataKey="surge"
              name="surge"
              stroke="#fbbf24"
              strokeWidth={1.5}
              fill="url(#gradSurge)"
              dot={false}
            />
          )}
          <Brush
            dataKey="date"
            height={28}
            stroke="var(--color-primary)"
            fill="var(--color-surface-alt)"
            travellerWidth={8}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Annotation footer */}
      <div style={{ padding: '0.375rem 0.75rem 0.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
          ● Yellow dots indicate surge pricing rides
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
          ─ ─ Dashed line shows average fare
        </span>
      </div>
    </Card>
  );
}
