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
