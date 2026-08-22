'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { requestPasswordReset } from '@/lib/auth/passwordReset';
import { FormError, FormMessage } from '@/components/FormFeedback';
import styles from './AuthForm.module.css';

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter the email address you use for the Staff Portal.');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className={styles.stack}>
        <FormMessage>
          If an account exists for <strong>{email.trim().toLowerCase()}</strong>, a reset link is on
          its way. Open it on this device — the link expires after a short time.
        </FormMessage>
        <p className={styles.hint}>
          Lost your authenticator? Use a recovery code when signing in, or ask your administrator to
          reset MFA.
        </p>
        <Link className={styles.link} href="/login">
          Back to sign in
        </Link>
        <button type="button" className={styles.linkButton} onClick={() => setSent(false)}>
          Wrong address? Change it
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <p className={styles.intro}>
        Enter the email on your Staff Portal account. We&apos;ll send a link to set a new password.
      </p>

      <label className={styles.label}>
        Email
        <input
          className={styles.input}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      {error ? <FormError>{error}</FormError> : null}

      <button className={styles.button} type="submit" disabled={loading}>
        {loading ? 'Sending…' : 'Send reset link'}
      </button>

      <Link className={styles.link} href="/login">
        Back to sign in
      </Link>
    </form>
  );
}
