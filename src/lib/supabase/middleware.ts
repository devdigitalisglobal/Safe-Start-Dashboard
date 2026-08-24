import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { env } from '@/lib/env';
import { authCookieOptions } from './cookieOptions';
import { createSupabaseCookieMethods } from './cookies';

/** Legacy helper — root `middleware.ts` is the active entry. Kept aligned for reference. */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookieOptions: authCookieOptions(),
    cookies: createSupabaseCookieMethods(
      () => request.cookies.getAll(),
      (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      }
    ),
  });

  await supabase.auth.getUser();
  return supabaseResponse;
}
