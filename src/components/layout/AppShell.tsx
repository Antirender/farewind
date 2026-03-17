import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from './AppShell.module.css';

const NAV = [
  { to: '/', label: 'Routes', icon: '🗂' },
  { to: '/add', label: 'Add Ride', icon: '＋' },
  { to: '/recommendation', label: 'Advice', icon: '💡' },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme, resetOnboarding } = useApp();
  const location = useLocation();

  return (
    <div className={styles.shell}>
      {/* Top header */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src="/favicon.svg" alt="" width={28} height={28} />
          <span className={styles.logo}>FareWind</span>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.iconBtn}
            onClick={resetOnboarding}
            title="Replay onboarding"
            aria-label="Replay onboarding"
          >
            🎓
          </button>
          <button
            className={styles.iconBtn}
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className={styles.main} key={location.pathname}>{children}</main>

      {/* Bottom nav (mobile) / sidebar would go at desktop, for simplicity bottom nav always */}
      <nav className={styles.nav} aria-label="Main navigation">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>{n.icon}</span>
            <span className={styles.navLabel}>{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
