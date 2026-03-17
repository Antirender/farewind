import type { Route, RideEntry, OnboardingStep } from '../types';

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

function randomPrice(base: number, variance: number) {
  return +(base + (rand() - 0.5) * 2 * variance).toFixed(2);
}

function makeEntry(
  routeId: string,
  daysAgo: number,
  hour: number,
  minute: number,
  base: number,
  variance: number,
  notes?: string,
): RideEntry {
  const d = new Date(2026, 2, 17); // March 17 2026 as anchor
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);

  const isPeakMorning = hour >= 7 && hour <= 9;
  const isPeakEvening = hour >= 17 && hour <= 19;
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const isLateNight = hour >= 22 || hour <= 4;

  let surgeMultiplier = 1.0;
  if (isPeakEvening && !isWeekend) surgeMultiplier = +(1.2 + rand() * 0.8).toFixed(1);
  else if (isPeakMorning && !isWeekend) surgeMultiplier = +(1.1 + rand() * 0.4).toFixed(1);
  else if (isLateNight && isWeekend) surgeMultiplier = +(1.3 + rand() * 1.0).toFixed(1);
  else if (isWeekend && hour >= 10 && hour <= 15) surgeMultiplier = 1.0;

  const surgedPrice = +(randomPrice(base, variance) * surgeMultiplier).toFixed(2);

  return {
    id: uid(),
    routeId,
    price: surgedPrice,
    currency: 'CAD',
    date: d.toISOString(),
    dayOfWeek: d.getDay(),
    hour,
    surgeMultiplier: surgeMultiplier > 1 ? surgeMultiplier : undefined,
    notes,
  };
}

/* ── seed routes ─────────────────────────────────────── */
export const seedRoutes: Route[] = [
  {
    id: 'route-1',
    name: 'Home → School',
    origin: '2548 North Ridge Trail, Oakville ON L6H 7R7',
    destination: '1430 Trafalgar Rd, Oakville, ON L6H 2L1',
    originCoords: [43.4396, -79.7083],
    destCoords: [43.4697, -79.7085],
    provider: 'Uber',
    rideType: 'UberX',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'route-1r',
    name: 'School → Home',
    origin: '1430 Trafalgar Rd, Oakville, ON L6H 2L1',
    destination: '2548 North Ridge Trail, Oakville ON L6H 7R7',
    originCoords: [43.4697, -79.7085],
    destCoords: [43.4396, -79.7083],
    provider: 'Uber',
    rideType: 'UberX',
    createdAt: '2026-01-15T10:05:00Z',
  },
  {
    id: 'route-2',
    name: 'Home → Airport',
    origin: '2548 North Ridge Trail, Oakville ON L6H 7R7',
    destination: 'Toronto Pearson International Airport (YYZ)',
    originCoords: [43.4396, -79.7083],
    destCoords: [43.6777, -79.6248],
    provider: 'Uber',
    rideType: 'UberX',
    createdAt: '2026-02-01T14:00:00Z',
  },
  {
    id: 'route-2r',
    name: 'Airport → Home',
    origin: 'Toronto Pearson International Airport (YYZ)',
    destination: '2548 North Ridge Trail, Oakville ON L6H 7R7',
    originCoords: [43.6777, -79.6248],
    destCoords: [43.4396, -79.7083],
    provider: 'Lyft',
    rideType: 'Lyft Standard',
    createdAt: '2026-02-01T14:05:00Z',
  },
  {
    id: 'route-3',
    name: 'Home → Downtown',
    origin: '2548 North Ridge Trail, Oakville ON L6H 7R7',
    destination: 'Union Station, 65 Front St W, Toronto, ON M5J 1E6',
    originCoords: [43.4396, -79.7083],
    destCoords: [43.6453, -79.3806],
    provider: 'Uber',
    rideType: 'UberX',
    createdAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'route-3r',
    name: 'Downtown → Home',
    origin: 'Union Station, 65 Front St W, Toronto, ON M5J 1E6',
    destination: '2548 North Ridge Trail, Oakville ON L6H 7R7',
    originCoords: [43.6453, -79.3806],
    destCoords: [43.4396, -79.7083],
    provider: 'Lyft',
    rideType: 'Lyft Standard',
    createdAt: '2026-02-15T09:05:00Z',
  },
];

/* ── realistic seed entries ──────────────────────────── */
export const seedEntries: RideEntry[] = (() => {
  const entries: RideEntry[] = [];

  // Route 1: Home → School — weekday commute, ~4 days/week, some gaps
  // Simulates a college student who sometimes drives, sometimes skips
  const schoolDays = [
    1, 2, 3, 5,     // week 1 (skipped Thu)
    8, 9, 11, 12,   // week 2 (skipped Wed)
    15, 16, 17, 18, 19, // week 3 (full week)
    22, 23, 25, 26,  // week 4
    29, 30, 32, 33,  // week 5
    36, 37, 38, 40,  // week 6
    43, 44, 46,      // week 7
    50, 51, 52, 53,  // week 8
  ];

  for (const d of schoolDays) {
    const morningMinute = Math.floor(rand() * 30) + 10; // 7:10–7:40 or 8:10–8:40
    const morningHour = rand() > 0.4 ? 8 : 7;
    entries.push(makeEntry('route-1', d, morningHour, morningMinute, 12, 2.5));
  }

  // Route 1r: School → Home — fewer entries (sometimes gets a ride from friends)
  const returnDays = schoolDays.filter(() => rand() > 0.35);
  for (const d of returnDays) {
    const pm = rand() > 0.5 ? 16 : 15;
    const minute = Math.floor(rand() * 45) + 5;
    entries.push(makeEntry('route-1r', d, pm, minute, 11.5, 2));
  }

  // Route 2: Home → Airport — very low frequency, ~1-2 trips per month
  const airportOutDays = [3, 18, 39, 54];
  for (const d of airportOutDays) {
    const h = [5, 6, 14, 15][Math.floor(rand() * 4)];
    const m = Math.floor(rand() * 50);
    entries.push(makeEntry('route-2', d, h, m, 38, 7,
      h < 7 ? 'Early morning flight' : undefined));
  }

  // Route 2r: Airport → Home
  const airportReturnDays = [6, 21, 42, 56];
  for (const d of airportReturnDays) {
    const h = [18, 20, 22, 23][Math.floor(rand() * 4)];
    const m = Math.floor(rand() * 50);
    entries.push(makeEntry('route-2r', d, h, m, 40, 8,
      h >= 22 ? 'Late arrival, tired' : undefined));
  }

  // Route 3: Home → Downtown — weekend social outings + occasional weekday evening
  const downtownOutDays = [
    6, 7, 13, 14, 20, 21, 27, 28, // weekends over 8 weeks
    4, 11, 25, 32, 46, // occasional weekday evenings
  ];
  for (const d of downtownOutDays) {
    const isWeekday = new Date(2026, 2, 17 - d).getDay() >= 1 && new Date(2026, 2, 17 - d).getDay() <= 5;
    const h = isWeekday ? (rand() > 0.5 ? 18 : 19) : (10 + Math.floor(rand() * 6));
    const m = Math.floor(rand() * 55);
    entries.push(makeEntry('route-3', d, h, m, 32, 6,
      isWeekday ? 'Dinner plans' : undefined));
  }

  // Route 3r: Downtown → Home — return trips, sometimes late night
  const downtownReturnDays = [
    6, 7, 13, 14, 20, 21, 27, 28,
    4, 11, 25, 32, 46,
  ];
  for (const d of downtownReturnDays) {
    const isWeekday = new Date(2026, 2, 17 - d).getDay() >= 1 && new Date(2026, 2, 17 - d).getDay() <= 5;
    const h = isWeekday ? (21 + Math.floor(rand() * 2)) : (20 + Math.floor(rand() * 4));
    const m = Math.floor(rand() * 55);
    entries.push(makeEntry('route-3r', d, h, m, 35, 7,
      h >= 23 ? 'Late night surge' : undefined));
  }

  return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
})();

/* ── onboarding steps ────────────────────────────────── */
export const onboardingSteps: OnboardingStep[] = [
  {
    title: 'Ride prices change constantly.',
    body: 'The same trip can cost $12 at 2 PM and $28 at 5 PM. Surge pricing, demand spikes, and driver availability create patterns that repeat — and you can learn to predict them.',
    visual: 'wave',
  },
  {
    title: 'When is the right time to leave?',
    body: "Should you book now or wait 20 minutes for a better price? FareWind turns that guesswork into a data-informed decision — powered entirely by the prices you log.",
    visual: 'clock',
  },
  {
    title: 'Your data builds the picture.',
    body: 'Each time you log a ride price, FareWind adds it to your personal history. Over time, you see exactly which hours, days, and routes cost the most — no APIs, no account linking, no tracking.',
    visual: 'chart',
  },
  {
    title: 'Smart timing, real savings.',
    body: 'With enough data points, FareWind tells you whether right now is a good time to ride, suggests cheaper windows, and flags time slots to avoid. Small timing shifts can save you hundreds per year.',
    visual: 'spark',
  },
];
