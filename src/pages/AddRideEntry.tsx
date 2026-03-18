import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Tooltip, { InfoIcon } from '../components/ui/Tooltip';
import { fetchRoute } from '../utils/routing';
import styles from './AddRideEntry.module.css';

/* ── Geocode helper (Nominatim) ──────── */
async function geocode(address: string): Promise<[number, number] | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FareWind/1.0 (student project)' },
    });
    const data = await res.json();
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    return null;
  } catch {
    return null;
  }
}

type Tab = 'ride' | 'route';

export default function AddRideEntry() {
  const { routes, addEntry, addRoute } = useApp();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'ride';

  const [tab, setTab] = useState<Tab>(initialTab);

  /* ── Ride form state ── */
  const [routeId, setRouteId] = useState(routes[0]?.id ?? '');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [price, setPrice] = useState('');
  const [surge, setSurge] = useState('1.0');
  const [notes, setNotes] = useState('');
  const [rideSaved, setRideSaved] = useState(false);

  /* ── Route form state ── */
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [provider, setProvider] = useState('Uber');
  const [rideType, setRideType] = useState('UberX');
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [routeSaved, setRouteSaved] = useState(false);

  function handleRideSubmit(e: FormEvent) {
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
    setRideSaved(true);
    setTimeout(() => nav('/'), 1200);
  }

  async function handleRouteSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !origin.trim() || !destination.trim()) return;
    setRouteLoading(true);
    setRouteError('');

    const [oc, dc] = await Promise.all([geocode(origin), geocode(destination)]);
    if (!oc || !dc) {
      setRouteError('Could not geocode one or both addresses. Please check and try again.');
      setRouteLoading(false);
      return;
    }

    const road = await fetchRoute(oc, dc);

    addRoute({
      name: name.trim(),
      origin: origin.trim(),
      destination: destination.trim(),
      originCoords: oc,
      destCoords: dc,
      provider: provider.trim(),
      rideType: rideType.trim(),
      routeGeometry: road?.geometry,
      distance: road?.distance,
      duration: road?.duration,
    });

    setRouteLoading(false);
    setRouteSaved(true);
    setTimeout(() => nav('/'), 1200);
  }

  /* Success state */
  if (rideSaved || routeSaved) {
    return (
      <div className={styles.page}>
        <Card>
          <div className={styles.success}>
            <span className={styles.successIcon}>✓</span>
            <p>{rideSaved ? 'Ride saved!' : 'Route created!'} Redirecting…</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Add</h1>
      <p className={styles.sub}>Log a ride entry or create a new route.</p>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'ride'}
          className={`${styles.tab} ${tab === 'ride' ? styles.tabActive : ''}`}
          onClick={() => setTab('ride')}
        >
          📝 Log Ride
        </button>
        <button
          role="tab"
          aria-selected={tab === 'route'}
          className={`${styles.tab} ${tab === 'route' ? styles.tabActive : ''}`}
          onClick={() => setTab('route')}
        >
          🗺 New Route
        </button>
      </div>

      {/* ── Log Ride Tab ── */}
      {tab === 'ride' && (
        <Card>
          <form onSubmit={handleRideSubmit} className={styles.form}>
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

            <label className={styles.label}>
              <span className={styles.labelText}>
                Date &amp; Time
                <Tooltip content="When did you take this ride?"><InfoIcon /></Tooltip>
              </span>
              <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className={styles.input} required />
            </label>

            <div className={styles.row}>
              <label className={styles.label}>
                <span className={styles.labelText}>
                  Price (CAD)
                  <Tooltip content="Total fare you were charged, including taxes."><InfoIcon /></Tooltip>
                </span>
                <input type="number" step="0.01" min="0.01" placeholder="e.g. 18.50" value={price} onChange={(e) => setPrice(e.target.value)} className={styles.input} required />
              </label>
              <label className={styles.label}>
                <span className={styles.labelText}>
                  Surge
                  <Tooltip content="Surge/dynamic pricing multiplier shown in the app. 1.0 = no surge."><InfoIcon /></Tooltip>
                </span>
                <input type="number" step="0.1" min="1" placeholder="1.0" value={surge} onChange={(e) => setSurge(e.target.value)} className={styles.input} required />
              </label>
            </div>

            <label className={styles.label}>
              <span className={styles.labelText}>Notes (optional)</span>
              <input type="text" placeholder="Weather, special event…" value={notes} onChange={(e) => setNotes(e.target.value)} className={styles.input} />
            </label>

            <Button type="submit" fullWidth size="lg">Save Ride</Button>
          </form>
        </Card>
      )}

      {/* ── New Route Tab ── */}
      {tab === 'route' && (
        <Card>
          <form onSubmit={handleRouteSubmit} className={styles.form}>
            <label className={styles.label}>
              <span className={styles.labelText}>
                Nickname
                <Tooltip content="A memorable name for this route, e.g. 'Home → Gym'."><InfoIcon /></Tooltip>
              </span>
              <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder='e.g. "Home → Gym"' required />
            </label>
            <label className={styles.label}>
              <span className={styles.labelText}>
                Origin address
                <Tooltip content="Where this ride starts. We'll geocode the address for mapping."><InfoIcon /></Tooltip>
              </span>
              <input className={styles.input} value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="e.g. 2374 Salcome Dr, Oakville ON" required />
            </label>
            <label className={styles.label}>
              <span className={styles.labelText}>
                Destination address
                <Tooltip content="Where this ride ends."><InfoIcon /></Tooltip>
              </span>
              <input className={styles.input} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. 1430 Trafalgar Rd, Oakville ON" required />
            </label>
            <div className={styles.row}>
              <label className={styles.label}>
                <span className={styles.labelText}>Provider</span>
                <input className={styles.input} value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Uber" />
              </label>
              <label className={styles.label}>
                <span className={styles.labelText}>Ride type</span>
                <input className={styles.input} value={rideType} onChange={(e) => setRideType(e.target.value)} placeholder="UberX" />
              </label>
            </div>
            {routeError && <p className={styles.formError}>{routeError}</p>}
            <Button type="submit" fullWidth size="lg" disabled={routeLoading}>
              {routeLoading ? 'Geocoding…' : 'Create Route'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
