import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import AppShell from './components/layout/AppShell';
import Onboarding from './pages/Onboarding';
import SavedRoutes from './pages/SavedRoutes';
import AddRideEntry from './pages/AddRideEntry';
import RouteInsights from './pages/RouteInsights';
import Recommendation from './pages/Recommendation';

export default function App() {
  const { hasOnboarded } = useApp();

  if (!hasOnboarded) {
    return <Onboarding />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<SavedRoutes />} />
        <Route path="/add" element={<AddRideEntry />} />
        <Route path="/insights/:routeId" element={<RouteInsights />} />
        <Route path="/recommendation" element={<Recommendation />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
