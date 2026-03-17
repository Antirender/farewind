import { useState, useRef, useEffect, type ReactNode } from 'react';
import styles from './Tooltip.module.css';

interface Props {
  content: string;
  children: ReactNode;
}

export default function Tooltip({ content, children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <span className={styles.wrap} ref={ref}>
      <span
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        role="button"
        tabIndex={0}
        aria-label="More info"
        onKeyDown={(e) => e.key === 'Enter' && setOpen(!open)}
      >
        {children}
      </span>
      {open && <span className={styles.bubble} role="tooltip">{content}</span>}
    </span>
  );
}

export function InfoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ display: 'inline', verticalAlign: 'middle' }}>
      <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <text x="7.5" y="11" textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor">i</text>
    </svg>
  );
}
