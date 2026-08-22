import { createClient } from '@/lib/supabase/client';

/** Staff Portal origin for Supabase redirectTo (client or server). */
export function getSiteOrigin(fallbackOrigin?: string): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (fallbackOrigin) return fallbackOrigin.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export function getPasswordResetRedirectUri(origin: string): string {
  const base = origin.replace(/\/$/, '');
  const next = encodeURIComponent('/set-password');
  return `${base}/auth/callback?next=${next}`;
}

function formatAuthError(message: string): string {
  if (/email rate limit exceeded/i.test(message)) {
    return 'Too many emails sent — wait about an hour and try again, or ask your administrator.';
  }
  return message;
}

function mapSignInError(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return 'Current password is incorrect.';
  }
  return formatAuthError(message);
}

export type ChangePasswordInput = {
  email: string;
  currentPassword: string;
  newPassword: string;
  mfaEnrolled: boolean;
  totpCode?: string;
};

export async function requestPasswordReset(email: string, origin?: string) {
  const siteOrigin = getSiteOrigin(origin);
  if (!siteOrigin) {
    throw new Error('Site URL is not configured. Set NEXT_PUBLIC_SITE_URL in .env.local.');
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: getPasswordResetRedirectUri(siteOrigin),
  });

  if (error) {
    throw new Error(formatAuthError(error.message));
  }
}

export async function updatePassword(newPassword: string) {
  if (newPassword.length < 8) {
    throw new Error('Use at least 8 characters');
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    throw new Error(formatAuthError(error.message));
  }
}

/** Verify current password (and MFA when enrolled), then set a new password. */
export async function changePassword(input: ChangePasswordInput) {
  const { email, currentPassword, newPassword, mfaEnrolled, totpCode } = input;

  if (newPassword.length < 8) {
    throw new Error('Use at least 8 characters.');
  }
  if (newPassword === currentPassword) {
    throw new Error('New password must be different from your current password.');
  }

  const supabase = createClient();

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: currentPassword,
  });
  if (signInError) {
    throw new Error(mapSignInError(signInError.message));
  }

  if (mfaEnrolled) {
    const code = totpCode?.trim();
    if (!code || code.length !== 6) {
      throw new Error('Enter the 6-digit code from your authenticator app.');
    }

    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) throw new Error(formatAuthError(factorsError.message));

    const factor = factors.totp.find((item) => item.status === 'verified');
    if (!factor) throw new Error('No verified authenticator found.');

    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factor.id,
      code,
    });
    if (verifyError) throw new Error(formatAuthError(verifyError.message));
  }

  await updatePassword(newPassword);
}
