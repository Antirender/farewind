import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { fetchRoute } from '../utils/routing';
import styles from './SavedRoutes.module.css';

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

export default function SavedRoutes() {
  const { routes, entries, addRoute, deleteRoute } = useApp();
  const nav = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [provider, setProvider] = useState('Uber');
  const [rideType, setRideType] = useState('UberX');

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !origin.trim() || !destination.trim()) return;
    setFormLoading(true);
    setFormError('');

    const [oc, dc] = await Promise.all([geocode(origin), geocode(destination)]);
    if (!oc || !dc) {
      setFormError('Could not geocode one or both addresses. Please check and try again.');
      setFormLoading(false);
      return;
    }

    // Fetch road geometry
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

    // Reset
    setName('');
    setOrigin('');
    setDestination('');
    setProvider('Uber');
    setRideType('UberX');
    setShowForm(false);
    setFormLoading(false);
  }

  function handleDelete(id: string, routeName: string) {
    if (window.confirm(`Delete "${routeName}" and all its ride entries?`)) {
      deleteRoute(id);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>Your Routes</h1>
          <p className={styles.sub}>Tap a route to explore price insights.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Route'}
        </Button>
      </div>

      {/* New route form */}
      {showForm && (
        <Card className={styles.formCard}>
          <form onSubmit={handleCreate} className={styles.form}>
            <h3 className={styles.formTitle}>Create a Route</h3>
            <label className={styles.fieldLabel}>
              Nickname
              <input className={styles.fieldInput} value={name} onChange={(e) => setName(e.target.value)} placeholder='e.g. "Home → Gym"' required />
            </label>
            <label className={styles.fieldLabel}>
              Origin address
              <input className={styles.fieldInput} value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="e.g. 2374 Salcome Dr, Oakville ON" required />
            </label>
            <label className={styles.fieldLabel}>
              Destination address
              <input className={styles.fieldInput} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. 1430 Trafalgar Rd, Oakville ON" required />
            </label>
            <div className={styles.formRow}>
              <label className={styles.fieldLabel}>
                Provider
                <input className={styles.fieldInput} value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Uber" />
              </label>
              <label className={styles.fieldLabel}>
                Ride type
                <input className={styles.fieldInput} value={rideType} onChange={(e) => setRideType(e.target.value)} placeholder="UberX" />
              </label>
            </div>
            {formError && <p className={styles.formError}>{formError}</p>}
            <Button type="submit" fullWidth disabled={formLoading}>
              {formLoading ? 'Geocoding…' : 'Create Route'}
            </Button>
          </form>
        </Card>
      )}

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
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => { e.stopPropagation(); handleDelete(r.id, r.name); }}
                  aria-label={`Delete ${r.name}`}
                  title="Delete route"
                >
                  ✕
                </button>
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
