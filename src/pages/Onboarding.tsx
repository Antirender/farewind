import { useEffect, useRef, useState, useCallback } from 'react';
import scrollama from 'scrollama';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import styles from './Onboarding.module.css';

const STEPS = [
  {
    title: 'Welcome to FareWind',
    body: 'Track your ride-hailing costs and discover the best times to book — saving you money on every trip.',
    visual: '🌊',
    hint: 'Scroll down to continue',
  },
  {
    title: 'Log Your Rides',
    body: 'After each ride, record the fare, time, and surge multiplier. It takes 10 seconds — FareWind does the rest.',
    visual: '📝',
    hint: 'One entry per ride is all you need',
  },
  {
    title: 'Spot the Patterns',
    body: 'Interactive charts and heatmaps reveal when prices are lowest — by hour, day, and route. See your data come alive.',
    visual: '📊',
    hint: 'Works best with 10+ rides logged',
  },
  {
    title: 'Get Smart Advice',
    body: 'Personalised recommendations tell you the cheapest window to book, backed by your real data — not estimates.',
    visual: '💡',
    hint: 'All analysis happens on your device',
  },
  {
    title: 'Ready to Go!',
    body: 'Your data stays on this device. No account, no tracking. We\'ve loaded 6 demo routes so you can explore right away.',
    visual: '🚀',
    hint: null,
  },
];

export default function Onboarding() {
  const { completeOnboarding } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<scrollama.ScrollamaInstance | null>(null);

  const handleStepEnter = useCallback(({ index }: { index: number }) => {
    setCurrentStep(index);
  }, []);

  useEffect(() => {
    scrollerRef.current = scrollama();
    scrollerRef.current
      .setup({
        step: `.${styles.step}`,
        offset: 0.5,
      })
      .onStepEnter(handleStepEnter);

    return () => scrollerRef.current?.destroy();
  }, [handleStepEnter]);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className={styles.page} ref={containerRef}>
      {/* Progress bar at top */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      {/* Sticky visual panel */}
      <div className={styles.stickyPanel}>
        <div className={styles.visual} key={currentStep}>
          <span className={styles.emoji}>{STEPS[currentStep].visual}</span>
        </div>
        {/* Progress dots */}
        <div className={styles.dots}>
          {STEPS.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i === currentStep ? styles.dotActive : ''} ${i < currentStep ? styles.dotDone : ''}`} />
          ))}
        </div>
        <span className={styles.counter}>Step {currentStep + 1} of {STEPS.length}</span>
      </div>

      {/* Scrollable text steps */}
      <div className={styles.scroller}>
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`${styles.step} ${i === currentStep ? styles.stepActive : ''}`}
            data-step={i}
          >
            <h2 className={styles.title}>{s.title}</h2>
            <p className={styles.body}>{s.body}</p>
            {s.hint && <p className={styles.hint}>{s.hint}</p>}
            {i === STEPS.length - 1 && (
              <Button size="lg" onClick={completeOnboarding} style={{ marginTop: '1.5rem' }}>
                🚀 Get Started
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Skip button */}
      <button className={styles.skip} onClick={completeOnboarding}>
        Skip intro →
      </button>
    </div>
  );
}
