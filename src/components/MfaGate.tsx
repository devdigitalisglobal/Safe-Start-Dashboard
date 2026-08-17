'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isDashboardRole } from '@/lib/access';
import { renderQrToCanvas, resolveTotpUri } from '@/lib/mfaQr';
import styles from './MfaGate.module.css';

type Props = {
  role: string;
  email: string;
};

type Step = 'loading' | 'enroll' | 'verify';

export function MfaGate({ role, email }: Props) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<Step>('loading');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (step !== 'enroll' || !totpUri) return;

    setQrReady(false);
    void renderQrToCanvas(canvasRef.current, totpUri)
      .then(() => setQrReady(true))
      .catch(() => {
        setError('Could not draw the QR code. Use the manual key below in your authenticator app.');
      });
  }, [step, totpUri]);

  async function bootstrap() {
    const supabase = createClient();
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();

    if (factorsError) {
      setError(factorsError.message);
      setStep('verify');
      return;
    }

    const verifiedTotp = factors.totp.filter((factor) => factor.status === 'verified');
    if (verifiedTotp.length === 0) {
      for (const factor of factors.totp.filter((item) => item.status !== 'verified')) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Staff Portal authenticator',
        issuer: 'Safe Start',
      });

      if (enrollError || !data?.totp?.secret) {
        setError(
          enrollError?.message ??
            'Could not start MFA enrollment. Enable TOTP in Supabase → Authentication → MFA.'
        );
        setStep('enroll');
        return;
      }

      setFactorId(data.id);
      setSecret(data.totp.secret);
      setTotpUri(resolveTotpUri(data.totp.uri, data.totp.secret, email));
      setStep('enroll');
      return;
    }

    const factor = verifiedTotp[0];
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: factor.id,
    });

    if (challengeError || !challenge) {
      setError(challengeError?.message ?? 'Could not start MFA verification.');
      setStep('verify');
      return;
    }

    setFactorId(factor.id);
    setChallengeId(challenge.id);
    setStep('verify');
  }

  async function copySecret() {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
    } catch {
      // Clipboard may be blocked; manual selection still works.
    }
  }

  function redirectAfterSuccess() {
    router.push(isDashboardRole(role) ? '/' : '/admin/modules');
    router.refresh();
  }

  async function handleEnrollSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: code.trim(),
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    redirectAfterSuccess();
  }

  async function handleVerifySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || !challengeId) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: code.trim(),
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    redirectAfterSuccess();
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  if (step === 'loading') {
    return <p className={styles.message}>Preparing multi-factor authentication…</p>;
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>
        {step === 'enroll' ? 'Set up authenticator app' : 'Enter verification code'}
      </h2>
      <p className={styles.body}>
        {step === 'enroll'
          ? 'Scan the QR code or paste the manual key into Google Authenticator, 1Password, or another TOTP app. Then enter the 6-digit code.'
          : 'Open your authenticator app and enter the current 6-digit code to finish signing in.'}
      </p>

      {step === 'enroll' && secret ? (
        <div className={styles.secretBox}>
          <p className={styles.secretLabel}>Manual setup key</p>
          <code className={styles.secretCode}>{secret}</code>
          <button type="button" className={styles.copyButton} onClick={copySecret}>
            Copy key
          </button>
        </div>
      ) : null}

      {step === 'enroll' ? (
        <div className={styles.qrWrap}>
          <canvas ref={canvasRef} aria-label="Authenticator QR code" />
          {!qrReady && !error ? (
            <p className={styles.message}>Generating QR code…</p>
          ) : null}
        </div>
      ) : null}

      <form
        className={styles.form}
        onSubmit={step === 'enroll' ? handleEnrollSubmit : handleVerifySubmit}
      >
        <label className={styles.label}>
          6-digit code
          <input
            className={styles.input}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />
        </label>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <button
          className={styles.button}
          type="submit"
          disabled={loading || code.length < 6 || (step === 'enroll' && !factorId)}
        >
          {loading ? 'Verifying…' : step === 'enroll' ? 'Enable MFA' : 'Verify and continue'}
        </button>
      </form>

      <button type="button" className={styles.linkButton} onClick={handleSignOut}>
        Sign out
      </button>
    </div>
  );
}
