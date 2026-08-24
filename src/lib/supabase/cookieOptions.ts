import type { CookieOptions } from '@supabase/ssr';
import { getSessionCookieMaxAgeSeconds } from '@/lib/sessionPolicy';

/** Auth cookies capped to the portal absolute session length (default 8 hours). */
export function authCookieOptions(options?: CookieOptions): CookieOptions {
  const { maxAge: _maxAge, expires: _expires, ...rest } = options ?? {};
  return {
    ...rest,
    path: rest.path ?? '/',
    sameSite: rest.sameSite ?? 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: getSessionCookieMaxAgeSeconds(),
  };
}
