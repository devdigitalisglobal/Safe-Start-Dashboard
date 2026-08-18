import styles from './modules/page.module.css';

export default function AdminLoading() {
  return (
    <div className={styles.loadingWrap} aria-busy="true" aria-label="Loading">
      <div className={styles.loadingBar} />
      <p className={styles.loadingText}>Loading…</p>
    </div>
  );
}
