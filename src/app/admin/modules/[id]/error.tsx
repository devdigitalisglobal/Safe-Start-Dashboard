'use client';

import { useEffect } from 'react';
import styles from '../page.module.css';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ModuleEditError({ error, reset }: Props) {
  useEffect(() => {
    console.error('Module editor error:', error);
  }, [error]);

  return (
    <div className={styles.errorWrap}>
      <h1 className={styles.errorTitle}>Couldn&apos;t load this module</h1>
      <p className={styles.errorBody}>
        {error.message || 'A server error occurred. Try again or return to the module list.'}
      </p>
      <div className={styles.errorActions}>
        <button type="button" className={styles.primaryButton} onClick={reset}>
          Retry
        </button>
        <a href="/admin/modules" className={styles.link}>
          Back to modules
        </a>
      </div>
    </div>
  );
}
