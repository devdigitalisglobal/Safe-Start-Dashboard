import type { CookieMethodsServer } from '@supabase/ssr';
import { authCookieOptions } from './cookieOptions';

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<typeof authCookieOptions>[0];
};

/** Shared Supabase SSR cookie adapter — auth cookies capped to portal session length. */
export function createSupabaseCookieMethods(
  getAll: CookieMethodsServer['getAll'],
  setAllImpl: (cookies: CookieToSet[]) => void
): CookieMethodsServer {
  return {
    getAll,
    setAll(cookiesToSet) {
      setAllImpl(
        cookiesToSet.map(({ name, value, options }) => ({
          name,
          value,
          options: authCookieOptions(options),
        }))
      );
    },
  };
}
