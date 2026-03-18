import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import type { Recommendation as Rec } from '../types';
import styles from './Recommendation.module.css';

function generateRecommendations(
  routes: ReturnType<typeof useApp>['routes'],
  entries: ReturnType<typeof useApp>['entries'],
): Rec[] {
  const recs: Rec[] = [];
  let id = 1;

  for (const route of routes) {
    const re = entries.filter((e) => e.routeId === route.id);
    if (re.length < 3) continue;

    // Group by hour
    const byHour: Record<number, number[]> = {};
    for (const e of re) {
      const h = new Date(e.date).getHours();
      (byHour[h] ??= []).push(e.price);
    }

    // Find cheapest and most expensive hours
    let cheapestHour = 0;
    let cheapestAvg = Infinity;
    let expensiveHour = 0;
    let expensiveAvg = -Infinity;

    for (const [h, prices] of Object.entries(byHour)) {
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      if (avg < cheapestAvg) {
        cheapestAvg = avg;
        cheapestHour = parseInt(h);
      }
      if (avg > expensiveAvg) {
        expensiveAvg = avg;
        expensiveHour = parseInt(h);
      }
    }

    const saving = expensiveAvg - cheapestAvg;
    const routeLabel = route.name;

    recs.push({
      id: `rec-${id++}`,
      routeId: route.id,
      type: 'cheapest_time',
      title: `Book around ${cheapestHour}:00 for ${routeLabel}`,
      body: `Average fare at ${cheapestHour}:00 is $${cheapestAvg.toFixed(2)}, compared to $${expensiveAvg.toFixed(2)} at ${expensiveHour}:00.`,
      reasoning: `Based on ${re.length} logged rides. Hourly averages compared across all ride data for this route.`,
      estimatedSaving: saving > 0 ? saving : undefined,
    });

    // Surge avoidance
    const highSurge = re.filter((e) => (e.surgeMultiplier ?? 1) >= 1.5);
    if (highSurge.length > 0) {
      const surgeHours = highSurge.map((e) => new Date(e.date).getHours());
      const mode = surgeHours.sort(
        (a, b) => surgeHours.filter((v) => v === b).length - surgeHours.filter((v) => v === a).length,
      )[0];
      recs.push({
        id: `rec-${id++}`,
        routeId: route.id,
        type: 'avoid_surge',
        title: `Avoid ${mode}:00 for ${routeLabel}`,
        body: `${highSurge.length} of your ${re.length} rides had surge ≥ 1.5×, most commonly around ${mode}:00.`,
        reasoning: 'Surge pricing detected. Shifting your departure by 30–60 minutes may help avoid peak pricing.',
      });
    }

    // Weekend vs weekday
    const weekday = re.filter((e) => {
      const d = new Date(e.date).getDay();
      return d >= 1 && d <= 5;
    });
    const weekend = re.filter((e) => {
      const d = new Date(e.date).getDay();
      return d === 0 || d === 6;
    });
    if (weekday.length >= 2 && weekend.length >= 2) {
      const wdAvg = weekday.reduce((s, e) => s + e.price, 0) / weekday.length;
      const weAvg = weekend.reduce((s, e) => s + e.price, 0) / weekend.length;
      const cheaper = wdAvg < weAvg ? 'weekdays' : 'weekends';
      const diff = Math.abs(wdAvg - weAvg);
      if (diff > 1) {
        recs.push({
          id: `rec-${id++}`,
          routeId: route.id,
          type: 'general',
          title: `${routeLabel} is cheaper on ${cheaper}`,
          body: `Average weekday: $${wdAvg.toFixed(2)}, weekend: $${weAvg.toFixed(2)} — $${diff.toFixed(2)} difference.`,
          reasoning: `Compared ${weekday.length} weekday rides to ${weekend.length} weekend rides.`,
          estimatedSaving: diff,
        });
      }
    }
  }

  return recs;
}

export default function Recommendation() {
  const { routes, entries } = useApp();
  const recs = useMemo(() => generateRecommendations(routes, entries), [routes, entries]);

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Smart Advice</h1>
      <p className={styles.sub}>Personalised recommendations based on your ride history.</p>

      {recs.length === 0 ? (
        <Card>
          <p className={styles.empty}>
            Not enough data yet. Log at least 3 rides on a route to get recommendations.
          </p>
        </Card>
      ) : (
        <div className={styles.list}>
          {recs.map((r) => (
            <Card key={r.id} className={styles.card}>
              <div className={styles.cardTop}>
                <Badge color={r.type === 'cheapest_time' ? 'success' : r.type === 'avoid_surge' ? 'danger' : 'primary'}>
                  {r.type === 'cheapest_time' ? '💰 Best Time' : r.type === 'avoid_surge' ? '⚡ Surge Alert' : '📊 Insight'}
                </Badge>
                {r.estimatedSaving != null && r.estimatedSaving > 0 && (
                  <span className={styles.saving}>Save ~${r.estimatedSaving.toFixed(2)}</span>
                )}
              </div>
              <h3 className={styles.recTitle}>{r.title}</h3>
              <p className={styles.recBody}>{r.body}</p>
              <p className={styles.reasoning}>{r.reasoning}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
