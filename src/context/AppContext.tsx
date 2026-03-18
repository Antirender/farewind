import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Route, RideEntry, ThemeMode } from '../types';
import { seedRoutes, seedEntries } from '../data/seed';

/* ── localStorage helpers ────────────────────────────── */
const STORAGE_KEYS = {
  theme: 'fw_theme',
  onboarded: 'fw_onboarded',
  routes: 'fw_routes',
  entries: 'fw_entries',
} as const;

function loadBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return v === 'true';
  } catch {
    return fallback;
  }
}

function loadString<T extends string>(key: string, fallback: T): T {
  try {
    return (localStorage.getItem(key) as T) ?? fallback;
  } catch {
    return fallback;
  }
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch { /* quota exceeded — silently fail */ }
}

/* ── context shape ───────────────────────────────────── */
interface AppState {
  routes: Route[];
  entries: RideEntry[];
  hasOnboarded: boolean;
  theme: ThemeMode;
  addRoute: (route: Omit<Route, 'id' | 'createdAt'>) => Route;
  updateRoute: (id: string, patch: Partial<Route>) => void;
  deleteRoute: (id: string) => void;
  addEntry: (entry: Omit<RideEntry, 'id' | 'dayOfWeek' | 'hour'>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  toggleTheme: () => void;
  resetToDemo: () => void;
  getEntriesForRoute: (routeId: string) => RideEntry[];
  getRoute: (routeId: string) => Route | undefined;
}

const AppContext = createContext<AppState | null>(null);

let nextId = Date.now();
const THEME_CYCLE: ThemeMode[] = ['dark', 'light', 'pink', 'blue'];

export function AppProvider({ children }: { children: ReactNode }) {
  const [routes, setRoutes] = useState<Route[]>(() =>
    loadJSON(STORAGE_KEYS.routes, seedRoutes),
  );
  const [entries, setEntries] = useState<RideEntry[]>(() =>
    loadJSON(STORAGE_KEYS.entries, seedEntries),
  );
  const [hasOnboarded, setHasOnboarded] = useState(() =>
    loadBool(STORAGE_KEYS.onboarded, false),
  );
  const [theme, setTheme] = useState<ThemeMode>(() =>
    loadString(STORAGE_KEYS.theme, 'dark'),
  );

  // Persist routes & entries
  useEffect(() => { save(STORAGE_KEYS.routes, JSON.stringify(routes)); }, [routes]);
  useEffect(() => { save(STORAGE_KEYS.entries, JSON.stringify(entries)); }, [entries]);

  // Sync theme to <html> attribute and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    save(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    save(STORAGE_KEYS.onboarded, String(hasOnboarded));
  }, [hasOnboarded]);

  const addRoute = useCallback((partial: Omit<Route, 'id' | 'createdAt'>) => {
    const route: Route = {
      ...partial,
      id: `route-${nextId++}`,
      createdAt: new Date().toISOString(),
    };
    setRoutes((prev) => [...prev, route]);
    return route;
  }, []);

  const updateRoute = useCallback((id: string, patch: Partial<Route>) => {
    setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const deleteRoute = useCallback((id: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
    setEntries((prev) => prev.filter((e) => e.routeId !== id));
  }, []);

  const addEntry = useCallback(
    (partial: Omit<RideEntry, 'id' | 'dayOfWeek' | 'hour'>) => {
      const d = new Date(partial.date);
      const entry: RideEntry = {
        ...partial,
        id: `entry-${nextId++}`,
        dayOfWeek: d.getDay(),
        hour: d.getHours(),
      };
      setEntries((prev) => [...prev, entry]);
    },
    [],
  );

  const completeOnboarding = useCallback(() => setHasOnboarded(true), []);
  const resetOnboarding = useCallback(() => setHasOnboarded(false), []);

  const toggleTheme = useCallback(
    () => setTheme((t) => {
      const idx = THEME_CYCLE.indexOf(t);
      return THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    }),
    [],
  );

  const resetToDemo = useCallback(() => {
    setRoutes(seedRoutes);
    setEntries(seedEntries);
  }, []);

  const getEntriesForRoute = useCallback(
    (routeId: string) => entries.filter((e) => e.routeId === routeId),
    [entries],
  );

  const getRoute = useCallback(
    (routeId: string) => routes.find((r) => r.id === routeId),
    [routes],
  );

  return (
    <AppContext.Provider
      value={{
        routes,
        entries,
        hasOnboarded,
        theme,
        addRoute,
        updateRoute,
        deleteRoute,
        addEntry,
        completeOnboarding,
        resetOnboarding,
        toggleTheme,
        resetToDemo,
        getEntriesForRoute,
        getRoute,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
