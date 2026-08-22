import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';
import { AUTH_COOKIE_MAX_AGE_SEC } from './cookieOptions';
import { createSupabaseCookieMethods } from './cookies';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookieOptions: {
      maxAge: AUTH_COOKIE_MAX_AGE_SEC,
      path: '/',
      sameSite: 'lax',
    },
    cookies: createSupabaseCookieMethods(
      () => cookieStore.getAll(),
      (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — middleware handles refresh.
        }
      }
    ),
  });
}
