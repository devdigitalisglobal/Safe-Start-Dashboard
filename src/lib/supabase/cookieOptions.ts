import type { CookieOptions } from '@supabase/ssr';

/** Supabase refresh tokens can live up to ~400 days — keep cookies across browser restarts. */
export const AUTH_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 400;

/** Merge Supabase cookie options with persistent, secure defaults for the staff portal. */
export function authCookieOptions(options?: CookieOptions): CookieOptions {
  return {
    ...options,
    path: options?.path ?? '/',
    sameSite: options?.sameSite ?? 'lax',
    secure: process.env.NODE_ENV === 'production',
    // Session cookies (no maxAge) are cleared when the browser closes — avoid that.
    maxAge: options?.maxAge ?? AUTH_COOKIE_MAX_AGE_SEC,
  };
}
