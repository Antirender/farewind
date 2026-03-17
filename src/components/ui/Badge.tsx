import styles from './Badge.module.css';

type Color = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface Props {
  children: string;
  color?: Color;
}

export default function Badge({ children, color = 'neutral' }: Props) {
  return <span className={`${styles.badge} ${styles[color]}`}>{children}</span>;
}
