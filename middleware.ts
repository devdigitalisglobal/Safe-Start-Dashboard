import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { env } from '@/lib/env';
import { isRateLimited } from '@/lib/rateLimit';
import { authCookieOptions } from '@/lib/supabase/cookieOptions';
import { createSupabaseCookieMethods } from '@/lib/supabase/cookies';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/login')) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';
    if (isRateLimited(`login:${ip}`, 5, 60_000)) {
      return new NextResponse('Too many login attempts. Try again shortly.', { status: 429 });
    }
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookieOptions: authCookieOptions(),
    cookies: createSupabaseCookieMethods(
      () => request.cookies.getAll(),
      (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      }
    ),
  });

  // Refreshes expired access tokens while the browser session is open.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = pathname.startsWith('/login') || pathname.startsWith('/auth');

  if (!user && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
