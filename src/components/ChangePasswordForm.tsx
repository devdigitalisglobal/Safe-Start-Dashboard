'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { changePassword } from '@/lib/auth/passwordReset';
import { signOutPortal } from '@/lib/portalSignOut';
import { FormError } from '@/components/FormFeedback';
import authStyles from './AuthForm.module.css';
import gateStyles from './MfaGate.module.css';

type Props = {
  email: string;
  mfaEnrolled: boolean;
};

export function ChangePasswordForm({ email, mfaEnrolled }: Props) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totpReady = !mfaEnrolled || totpCode.length === 6;
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    confirmPassword.length >= 8 &&
    totpReady;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        email,
        currentPassword,
        newPassword,
        mfaEnrolled,
        totpCode: mfaEnrolled ? totpCode : undefined,
      });

      await signOutPortal();
      router.replace('/login?reset=success');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change password. Try again.');
      setLoading(false);
    }
  }

  const forgotHref = `/forgot-password?email=${encodeURIComponent(email.trim().toLowerCase())}`;

  return (
    <form className={authStyles.form} onSubmit={handleSubmit}>
      <label className={authStyles.label}>
        Current password
        <input
          className={authStyles.input}
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </label>

      <label className={authStyles.label}>
        New password
        <input
          className={authStyles.input}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </label>

      <label className={authStyles.label}>
        Confirm new password
        <input
          className={authStyles.input}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </label>

      {mfaEnrolled ? (
        <label className={gateStyles.label}>
          Authenticator code
          <input
            className={gateStyles.input}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            required
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
          />
        </label>
      ) : null}

      {mfaEnrolled && totpCode.length < 6 ? (
        <p className={authStyles.hint}>Enter all 6 digits from your authenticator app.</p>
      ) : null}

      {error ? <FormError>{error}</FormError> : null}

      <button
        className={authStyles.button}
        type="submit"
        disabled={loading || !canSubmit}
        aria-label="Change password"
      >
        {loading ? 'Saving…' : 'Change password'}
      </button>

      <p className={authStyles.hint}>
        Don&apos;t know your current password?{' '}
        <Link className={authStyles.inlineLink} href={forgotHref}>
          Reset by email
        </Link>
      </p>
    </form>
  );
}
