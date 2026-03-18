import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Tooltip, { InfoIcon } from '../components/ui/Tooltip';
import styles from './AddRideEntry.module.css';

export default function AddRideEntry() {
  const { routes, addEntry } = useApp();
  const nav = useNavigate();

  const [routeId, setRouteId] = useState(routes[0]?.id ?? '');
  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  });
  const [price, setPrice] = useState('');
  const [surge, setSurge] = useState('1.0');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const p = parseFloat(price);
    const s = parseFloat(surge);
    if (!routeId || isNaN(p) || p <= 0 || isNaN(s) || s < 1) return;

    addEntry({
      routeId,
      date: new Date(date).toISOString(),
      price: p,
      currency: 'CAD',
      surgeMultiplier: s,
      notes: notes.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => nav('/'), 1200);
  }

  if (saved) {
    return (
      <div className={styles.page}>
        <Card>
          <div className={styles.success}>
            <span className={styles.successIcon}>✓</span>
            <p>Ride saved! Redirecting…</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Log a Ride</h1>
      <p className={styles.sub}>Record ride details to unlock insights.</p>

      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Route */}
          <label className={styles.label}>
            <span className={styles.labelText}>
              Route
              <Tooltip content="Select the route this ride belongs to."><InfoIcon /></Tooltip>
            </span>
            <select value={routeId} onChange={(e) => setRouteId(e.target.value)} className={styles.input} required>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.origin} → {r.destination}
                </option>
              ))}
            </select>
          </label>

          {/* Date/time */}
          <label className={styles.label}>
            <span className={styles.labelText}>
              Date &amp; Time
              <Tooltip content="When did you take this ride?"><InfoIcon /></Tooltip>
            </span>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={styles.input}
              required
            />
          </label>

          {/* Price + Surge row */}
          <div className={styles.row}>
            <label className={styles.label}>
              <span className={styles.labelText}>
                Price (CAD)
                <Tooltip content="Total fare you were charged, including taxes."><InfoIcon /></Tooltip>
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 18.50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={styles.input}
                required
              />
            </label>
            <label className={styles.label}>
              <span className={styles.labelText}>
                Surge
                <Tooltip content="Surge/dynamic pricing multiplier shown in the app. 1.0 = no surge."><InfoIcon /></Tooltip>
              </span>
              <input
                type="number"
                step="0.1"
                min="1"
                placeholder="1.0"
                value={surge}
                onChange={(e) => setSurge(e.target.value)}
                className={styles.input}
                required
              />
            </label>
          </div>

          {/* Notes */}
          <label className={styles.label}>
            <span className={styles.labelText}>Notes (optional)</span>
            <input
              type="text"
              placeholder="Weather, special event…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.input}
            />
          </label>

          <Button type="submit" fullWidth size="lg">
            Save Ride
          </Button>
        </form>
      </Card>
    </div>
  );
}
