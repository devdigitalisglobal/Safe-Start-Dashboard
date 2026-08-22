import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/env';
import { AUTH_COOKIE_MAX_AGE_SEC } from './cookieOptions';

export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookieOptions: {
      maxAge: AUTH_COOKIE_MAX_AGE_SEC,
      path: '/',
      sameSite: 'lax',
    },
  });
}
