import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { RideEntry } from '../../types';
import Card from '../ui/Card';

interface Props {
  entries: RideEntry[];
}

export default function PriceTrendChart({ entries }: Props) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const data = sorted.map((e) => ({
    date: new Date(e.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
    price: e.price,
    surge: e.surgeMultiplier,
  }));

  if (data.length === 0) {
    return <Card><p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0' }}>No data yet</p></Card>;
  }

  return (
    <Card padding="sm">
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', padding: '0.5rem 0.5rem 0' }}>
        Price Trend
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="gradPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickFormatter={(v: number) => `$${v}`} />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '0.8125rem',
            }}
            formatter={(v: number, name: string) => [
              name === 'price' ? `$${v.toFixed(2)}` : `${v.toFixed(2)}x`,
              name === 'price' ? 'Price' : 'Surge',
            ]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#gradPrice)"
            dot={{ r: 3, fill: 'var(--color-primary)' }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
