import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/env';
import { authCookieOptions } from './cookieOptions';

export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookieOptions: authCookieOptions(),
  });
}
