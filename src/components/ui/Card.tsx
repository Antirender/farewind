import type { ReactNode, HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'highlighted';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  clickable?: boolean;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  clickable,
  className = '',
  ...rest
}: Props) {
  return (
    <div
      className={`${styles.card} ${styles[variant]} ${styles[`pad-${padding}`]} ${clickable ? styles.clickable : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
