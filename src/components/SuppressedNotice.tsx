import styles from './SuppressedNotice.module.css';

type Props = {
  reason?: string;
};

export function SuppressedNotice({ reason }: Props) {
  return (
    <div className={styles.notice} role="status">
      <p className={styles.title}>Figure withheld</p>
      <p className={styles.body}>
        {reason ??
          'Fewer than 5 students in this cohort — aggregate withheld to protect privacy.'}
      </p>
    </div>
  );
}
