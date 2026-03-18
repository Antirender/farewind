import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import styles from './About.module.css';

const FEATURES = [
  { icon: '📊', name: 'Price Trend Chart', desc: 'Interactive area chart with zoom, surge dots, and average reference line.' },
  { icon: '🗓', name: 'Day × Hour Heatmap', desc: 'Click any cell to see exactly when rides are cheapest or most expensive.' },
  { icon: '🗺', name: 'Route Map', desc: 'Full-page Leaflet map with real road geometry from OSRM and colour-coded routes.' },
  { icon: '💡', name: 'Smart Advice', desc: 'Rule-based recommendations that flag the cheapest time, worst surges, and estimated savings.' },
  { icon: '➕', name: 'Custom Routes', desc: 'Add your own origin/destination with auto-geocoding and live map preview.' },
  { icon: '🎨', name: '4 Themes', desc: 'Dark, Light, Pink, and Blue — every theme meets WCAG AAA contrast.' },
];

const STACK = [
  'React 19', 'TypeScript 5', 'Vite 6', 'Recharts 2',
  'Leaflet 1.9', 'Scrollama 3', 'CSS Modules',
];

export default function About() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>About FareWind</h1>
      <p className={styles.tagline}>
        A speculative data-viz prototype for ride-hailing fare timing.
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What it does</h2>
        <p className={styles.body}>
          Ride-hailing prices change constantly — the same trip can cost $12 at 2 PM
          and $28 at 5 PM. FareWind lets you log each ride you take and builds a
          personal price history. Over time the app surfaces which hours, days, and
          routes cost the most, so you can make smarter timing decisions — no account
          linking, no tracking, everything stays on your device.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Key features</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map((f) => (
            <Card key={f.name} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <span className={styles.featureName}>{f.name}</span>
              <span className={styles.featureDesc}>{f.desc}</span>
            </Card>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tech stack</h2>
        <div className={styles.stack}>
          {STACK.map((s) => (
            <Badge key={s} color="primary">{s}</Badge>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        Built as a portfolio prototype for VDES 39915 at Sheridan College.
        All data is generated client-side and stored in localStorage — nothing
        leaves your browser.
      </footer>
    </div>
  );
}
