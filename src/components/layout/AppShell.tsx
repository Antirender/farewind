import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { ThemeMode } from '../../types';
import styles from './AppShell.module.css';

const THEME_META: Record<ThemeMode, { icon: string; next: string; navIcons: Record<string, string> }> = {
  dark:  { icon: '🌙', next: 'Light',  navIcons: { '/': '🗂', '/add': '＋', '/map': '🗺', '/recommendation': '💡', '/about': 'ℹ️' } },
  light: { icon: '☀️', next: 'Pink',   navIcons: { '/': '📁', '/add': '➕', '/map': '🌍', '/recommendation': '✨', '/about': 'ℹ️' } },
  pink:  { icon: '🌸', next: 'Blue',   navIcons: { '/': '💕', '/add': '🎀', '/map': '🗺', '/recommendation': '💖', '/about': '💌' } },
  blue:  { icon: '🌊', next: 'Dark',   navIcons: { '/': '📋', '/add': '📝', '/map': '🧭', '/recommendation': '💎', '/about': '📖' } },
};

const NAV = [
  { to: '/', label: 'Routes' },
  { to: '/add', label: 'Add' },
  { to: '/map', label: 'Map' },
  { to: '/recommendation', label: 'Advice' },
  { to: '/about', label: 'About' },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme, resetOnboarding } = useApp();
  const location = useLocation();
  const meta = THEME_META[theme];

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
            className={styles.textBtn}
            onClick={resetOnboarding}
            title="Replay onboarding"
            aria-label="Replay onboarding"
          >
            🎓 <span className={styles.btnLabel}>Guide</span>
          </button>
          <button
            className={styles.textBtn}
            onClick={toggleTheme}
            title={`Switch to ${meta.next} mode`}
            aria-label={`Switch to ${meta.next} mode`}
          >
            {meta.icon} <span className={styles.btnLabel}>{meta.next}</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className={styles.main} key={location.pathname}>{children}</main>

      {/* Bottom nav */}
      <nav className={styles.nav} aria-label="Main navigation">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>{meta.navIcons[n.to]}</span>
            <span className={styles.navLabel}>{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
