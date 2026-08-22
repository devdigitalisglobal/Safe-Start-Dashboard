import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/';
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'));
  const authError = searchParams.get('error_description') ?? searchParams.get('error');

  if (authError) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'reset_link_invalid');
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('error', 'reset_link_invalid');
  return NextResponse.redirect(loginUrl);
}
