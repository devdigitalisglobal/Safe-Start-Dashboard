'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { isCmsRole, isDashboardRole } from '@/lib/access';
import { updatePassword } from '@/lib/auth/passwordReset';
import { getTokenAal, isPortalMfaRequired } from '@/lib/mfa';
import { signOutPortal } from '@/lib/portalSignOut';
import { createClient } from '@/lib/supabase/client';
import { FormError } from '@/components/FormFeedback';
import styles from './AuthForm.module.css';

export function SetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.replace('/login?error=reset_link_invalid');
        return;
      }

      await updatePassword(password);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_URL is not configured.');
      }

      const profileRes = await fetch(`${apiUrl}/users/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!profileRes.ok) {
        await signOutPortal();
        router.replace('/login?error=reset_link_invalid');
        return;
      }

      const profile = (await profileRes.json()) as { role?: string };
      const role = profile.role ?? '';

      if (!isDashboardRole(role) && !isCmsRole(role)) {
        await signOutPortal();
        router.replace('/login?error=learner_reset');
        return;
      }

      if (
        isPortalMfaRequired() &&
        (isDashboardRole(role) || isCmsRole(role)) &&
        getTokenAal(session.access_token) !== 'aal2'
      ) {
        router.push('/account/mfa');
        router.refresh();
        return;
      }

      await signOutPortal();
      router.replace('/login?reset=success');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save password. Try again.');
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <p className={styles.intro}>
        Choose a new password for your Staff Portal account. You will sign in again after saving.
      </p>

      <label className={styles.label}>
        New password
        <input
          className={styles.input}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      <label className={styles.label}>
        Confirm password
        <input
          className={styles.input}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </label>

      {error ? <FormError>{error}</FormError> : null}

      <button className={styles.button} type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Save password'}
      </button>
    </form>
  );
}
