import { Suspense } from 'react';
import { ForgotPasswordForm } from '@/components/ForgotPasswordForm';
import styles from '../login/page.module.css';

export default function ForgotPasswordPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Safe Start for Young Drivers</p>
        <h1 className={styles.title}>Reset password</h1>
        <p className={styles.subtitle}>Staff Portal — we&apos;ll email you a secure link.</p>
        <Suspense fallback={null}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
