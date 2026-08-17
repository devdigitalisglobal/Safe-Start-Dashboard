import styles from './MetricTile.module.css';

type Props = {
  label: string;
  value: string | number | null;
  note?: string;
  suppressed?: boolean;
};

export function MetricTile({ label, value, note, suppressed }: Props) {
  return (
    <article className={styles.tile}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>
        {suppressed ? '—' : value ?? '—'}
      </p>
      {note ? <p className={styles.note}>{note}</p> : null}
    </article>
  );
}
