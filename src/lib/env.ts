function requirePublicEnv(value: string | undefined, name: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env.local and restart the dev server.`
    );
  }
  return trimmed;
}

// Static process.env.* access is required — Next.js only inlines NEXT_PUBLIC_ vars
// when referenced literally, not via process.env[variableName].
export const env = {
  apiUrl: requirePublicEnv(process.env.NEXT_PUBLIC_API_URL, 'NEXT_PUBLIC_API_URL'),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '') ?? '',
  supabaseUrl: requirePublicEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: requirePublicEnv(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ),
  requirePortalMfa: process.env.NEXT_PUBLIC_REQUIRE_PORTAL_MFA !== 'false',
};
