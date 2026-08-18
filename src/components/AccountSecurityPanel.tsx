'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { fetchMfaStatus, generateRecoveryCodes } from '@/lib/mfaApi';
import { RecoveryCodesPanel } from '@/components/RecoveryCodesPanel';
import styles from '@/app/account/account.module.css';
import gateStyles from './MfaGate.module.css';

type Props = {
  mfaRequired: boolean;
};

export function AccountSecurityPanel({ mfaRequired }: Props) {
  const [status, setStatus] = useState<{ mfaEnrolled: boolean; unusedRecoveryCodes: number } | null>(
    null
  );
  const [totpCode, setTotpCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadStatus();
  }, []);

  async function loadStatus() {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const data = await fetchMfaStatus(session.access_token);
      setStatus(data);
    } catch {
      setStatus(null);
    }
  }

  async function regenerateCodes(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not signed in');

      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const factor = factors.totp.find((item) => item.status === 'verified');
      if (!factor) throw new Error('No verified authenticator found');

      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId: factor.id,
        code: totpCode.trim(),
      });
      if (verifyError) throw verifyError;

      const result = await generateRecoveryCodes(session.access_token);
      setRecoveryCodes(result.codes);
      setTotpCode('');
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not regenerate codes');
    } finally {
      setLoading(false);
    }
  }

  if (recoveryCodes) {
    return (
      <RecoveryCodesPanel
        codes={recoveryCodes}
        title="New recovery codes"
        onConfirm={() => {
          setRecoveryCodes(null);
          void loadStatus();
        }}
      />
    );
  }

  return (
    <>
      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Authenticator app (MFA)</h2>
        <p className={styles.panelBody}>
          {mfaRequired
            ? 'Multi-factor authentication is required for Staff Portal access.'
            : 'MFA is disabled in this environment (NEXT_PUBLIC_REQUIRE_PORTAL_MFA=false).'}
        </p>
        {mfaRequired ? (
          <>
            <span className={styles.badge}>
              {status?.mfaEnrolled ? 'Authenticator enrolled' : 'Not enrolled yet'}
            </span>
            <Link href="/account/mfa" className={styles.link}>
              Open MFA setup / verification →
            </Link>
          </>
        ) : null}
      </section>

      {mfaRequired && status?.mfaEnrolled ? (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Recovery codes</h2>
          <p className={styles.panelBody}>
            {status.unusedRecoveryCodes > 0
              ? `${status.unusedRecoveryCodes} unused recovery code${status.unusedRecoveryCodes === 1 ? '' : 's'} on file.`
              : 'No unused recovery codes remain. Generate a new set below.'}
          </p>

          <form className={gateStyles.form} onSubmit={regenerateCodes}>
            <label className={gateStyles.label}>
              Current 6-digit code
              <input
                className={gateStyles.input}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              />
            </label>
            <button
              type="submit"
              className={gateStyles.button}
              disabled={loading || totpCode.length < 6}
            >
              {loading ? 'Generating…' : 'Generate new recovery codes'}
            </button>
          </form>

          {error ? (
            <p className={gateStyles.error} role="alert">
              {error}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Lost your authenticator?</h2>
        <p className={styles.panelBody}>
          Use a recovery code on the MFA screen, or ask an Auto Verifi administrator to reset MFA
          from the Team page.
        </p>
      </section>
    </>
  );
}
