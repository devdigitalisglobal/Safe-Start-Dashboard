import type { CookieOptions } from '@supabase/ssr';

/** Session-only auth cookies — cleared when the browser closes. */
export function authCookieOptions(options?: CookieOptions): CookieOptions {
  const { maxAge: _maxAge, expires: _expires, ...rest } = options ?? {};
  return {
    ...rest,
    path: rest.path ?? '/',
    sameSite: rest.sameSite ?? 'lax',
    secure: process.env.NODE_ENV === 'production',
  };
}
