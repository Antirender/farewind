export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  originCoords: [number, number]; // [lat, lng]
  destCoords: [number, number];
  provider: string;
  rideType: string;
  createdAt: string;
  routeGeometry?: [number, number][]; // polyline coords [lat, lng][]
  distance?: number; // meters
  duration?: number; // seconds
}

export interface RideEntry {
  id: string;
  routeId: string;
  price: number;
  currency: string;
  date: string;          // ISO date-time
  dayOfWeek: number;     // 0=Sun … 6=Sat
  hour: number;          // 0–23
  surgeMultiplier?: number;
  notes?: string;
}

export interface Recommendation {
  id: string;
  routeId: string;
  type: 'cheapest_time' | 'avoid_surge' | 'general';
  title: string;
  body: string;
  reasoning: string;
  estimatedSaving?: number;
}

export type ThemeMode = 'light' | 'dark' | 'pink' | 'blue';
