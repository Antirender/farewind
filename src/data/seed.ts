import type { Route, RideEntry } from '../types';

/* ── deterministic seeded random ─────────────────────── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

let _id = 0;
const uid = () => `entry-${++_id}`;

/* ── GTA Uber fare model (CAD, early-2026 rates) ────── */
function uberFare(km: number, min: number, surge: number): number {
  const raw = (3.25 + 0.20 * min + 0.88 * km + 2.50) * (0.80 + rand() * 0.40);
  return +(raw * surge).toFixed(2);
}

function surgeFactor(hour: number, dow: number): number {
  const wd = dow >= 1 && dow <= 5;
  if (wd && hour >= 7 && hour <= 9)    return +(1.2 + rand() * 0.9).toFixed(2);
  if (wd && hour >= 14 && hour <= 15)  return +(1.0 + rand() * 0.3).toFixed(2);
  if (wd && hour >= 17 && hour <= 19)  return +(1.3 + rand() * 1.0).toFixed(2);
  if (hour >= 22 || hour <= 2)         return +(1.4 + rand() * 1.1).toFixed(2);
  if (!wd && hour >= 8 && hour <= 11)  return +(1.0 + rand() * 0.2).toFixed(2);
  if (!wd && hour >= 15 && hour <= 21) return +(1.1 + rand() * 0.5).toFixed(2);
  return +(1.0 + rand() * 0.15).toFixed(2);
}

function makeEntry(
  routeId: string, date: Date, km: number, min: number, notes?: string,
): RideEntry {
  const h = date.getHours();
  const dow = date.getDay();
  const surge = surgeFactor(h, dow);
  return {
    id: uid(), routeId,
    price: uberFare(km, min, surge),
    currency: 'CAD',
    date: date.toISOString(),
    dayOfWeek: dow, hour: h,
    surgeMultiplier: surge > 1.1 ? +surge.toFixed(1) : undefined,
    notes,
  };
}

/* ── exact coordinates ───────────────────────────────── */
const HOME:     [number, number] = [43.49256, -79.70551];
const SCHOOL:   [number, number] = [43.46895, -79.69862];
const AIRPORT:  [number, number] = [43.6777,  -79.6248];
const DOWNTOWN: [number, number] = [43.6453,  -79.3806];

const RD = {
  school:   { km: 4.5,  min: 9 },
  airport:  { km: 28,   min: 25 },
  downtown: { km: 45,   min: 38 },
};

/* ── seed routes ─────────────────────────────────────── */
export const seedRoutes: Route[] = [
  {
    id: 'route-1', name: 'Home → School',
    origin: '2374 Salcome Dr, Oakville ON L6H 7N3',
    destination: '1430 Trafalgar Rd, Oakville, ON L6H 2L1',
    originCoords: HOME, destCoords: SCHOOL,
    provider: 'Uber', rideType: 'UberX',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'route-1r', name: 'School → Home',
    origin: '1430 Trafalgar Rd, Oakville, ON L6H 2L1',
    destination: '2374 Salcome Dr, Oakville ON L6H 7N3',
    originCoords: SCHOOL, destCoords: HOME,
    provider: 'Uber', rideType: 'UberX',
    createdAt: '2026-01-15T10:05:00Z',
  },
  {
    id: 'route-2', name: 'Home → Airport',
    origin: '2374 Salcome Dr, Oakville ON L6H 7N3',
    destination: 'Toronto Pearson International Airport (YYZ)',
    originCoords: HOME, destCoords: AIRPORT,
    provider: 'Uber', rideType: 'UberX',
    createdAt: '2026-02-01T14:00:00Z',
  },
  {
    id: 'route-2r', name: 'Airport → Home',
    origin: 'Toronto Pearson International Airport (YYZ)',
    destination: '2374 Salcome Dr, Oakville ON L6H 7N3',
    originCoords: AIRPORT, destCoords: HOME,
    provider: 'Lyft', rideType: 'Lyft Standard',
    createdAt: '2026-02-01T14:05:00Z',
  },
  {
    id: 'route-3', name: 'Home → Downtown',
    origin: '2374 Salcome Dr, Oakville ON L6H 7N3',
    destination: 'Union Station, 65 Front St W, Toronto, ON M5J 1E6',
    originCoords: HOME, destCoords: DOWNTOWN,
    provider: 'Uber', rideType: 'UberX',
    createdAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'route-3r', name: 'Downtown → Home',
    origin: 'Union Station, 65 Front St W, Toronto, ON M5J 1E6',
    destination: '2374 Salcome Dr, Oakville ON L6H 7N3',
    originCoords: DOWNTOWN, destCoords: HOME,
    provider: 'Lyft', rideType: 'Lyft Standard',
    createdAt: '2026-02-15T09:05:00Z',
  },
];

/* ── seed entries ────────────────────────────────────── */
/*
  Schedule (anchor: Tue Mar 17 2026):
    Tue  — class 9 AM–3 PM   (ride ~8:20–8:40, home ~3:00–3:20)
    Wed  — class 8 AM–2 PM   (ride ~7:20–7:40, home ~2:00–2:20)
    Fri  — class 9 AM–12 PM  (ride ~8:20–8:40, home ~12:00–12:20)
    Mon  — NO rides
    Thu / Sat / Sun — Downtown (out 8–12 AM, back 1–11 PM)
  Airport — only 2 round-trips (Aug 2025, Jan 2026)
  3 complete gap days with zero records
*/
export const seedEntries: RideEntry[] = (() => {
  const entries: RideEntry[] = [];
  const anchor = new Date(2026, 2, 17); // Tue Mar 17

  const dt = (ago: number, h: number, m: number): Date => {
    const d = new Date(anchor);
    d.setDate(d.getDate() - ago);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const GAPS = new Set([9, 26, 46]); // Sun Mar 8, Thu Feb 19, Fri Jan 30

  for (let ago = 0; ago < 70; ago++) {
    if (GAPS.has(ago)) continue;
    const sample = new Date(anchor);
    sample.setDate(sample.getDate() - ago);
    const dow = sample.getDay();

    if (dow === 1) continue; // Monday — never ride

    /* ── School days ── */
    if (dow === 2) { // Tuesday 9 AM–3 PM
      entries.push(makeEntry('route-1', dt(ago, 8, 20 + Math.floor(rand() * 20)),
        RD.school.km, RD.school.min));
      if (rand() > 0.25)
        entries.push(makeEntry('route-1r', dt(ago, 15, Math.floor(rand() * 20)),
          RD.school.km, RD.school.min));
    }
    if (dow === 3) { // Wednesday 8 AM–2 PM
      entries.push(makeEntry('route-1', dt(ago, 7, 20 + Math.floor(rand() * 20)),
        RD.school.km, RD.school.min));
      if (rand() > 0.25)
        entries.push(makeEntry('route-1r', dt(ago, 14, Math.floor(rand() * 20)),
          RD.school.km, RD.school.min));
    }
    if (dow === 5) { // Friday 9 AM–12 PM
      entries.push(makeEntry('route-1', dt(ago, 8, 20 + Math.floor(rand() * 20)),
        RD.school.km, RD.school.min));
      if (rand() > 0.25)
        entries.push(makeEntry('route-1r', dt(ago, 12, Math.floor(rand() * 20)),
          RD.school.km, RD.school.min));
    }

    /* ── Downtown days (Thu / Sat / Sun) ── */
    if ((dow === 4 || dow === 0 || dow === 6) && rand() > 0.15) {
      const outH = 8 + Math.floor(rand() * 4);
      entries.push(makeEntry('route-3', dt(ago, outH, Math.floor(rand() * 50)),
        RD.downtown.km, RD.downtown.min));
      const retH = 13 + Math.floor(rand() * 10);
      entries.push(makeEntry('route-3r', dt(ago, retH, Math.floor(rand() * 50)),
        RD.downtown.km, RD.downtown.min,
        retH >= 21 ? 'Late night return' : undefined));
    }
  }

  /* ── Airport: exactly 2 round-trips (4 entries) ── */
  entries.push(makeEntry('route-2',
    new Date(2025, 7, 15, 6, 30), RD.airport.km, RD.airport.min,
    'Early morning flight'));
  entries.push(makeEntry('route-2r',
    new Date(2025, 7, 25, 21, 45), RD.airport.km, RD.airport.min,
    'Late arrival — delayed flight'));
  entries.push(makeEntry('route-2',
    new Date(2026, 0, 3, 14, 15), RD.airport.km, RD.airport.min,
    'Winter break trip'));
  entries.push(makeEntry('route-2r',
    new Date(2026, 0, 12, 19, 20), RD.airport.km, RD.airport.min));

  return entries.sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime());
})();

