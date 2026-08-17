function decodeBase64Url(segment: string) {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64').toString('utf8');
  }
  return atob(base64);
}

export function getTokenAal(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const claims = JSON.parse(decodeBase64Url(payload)) as { aal?: string };
    return claims.aal ?? null;
  } catch {
    return null;
  }
}

/** Set `NEXT_PUBLIC_REQUIRE_PORTAL_MFA=false` in .env.local for local dev without TOTP. */
export function isPortalMfaRequired() {
  return process.env.NEXT_PUBLIC_REQUIRE_PORTAL_MFA !== 'false';
}

export function hasMfaSatisfied(token: string) {
  if (!isPortalMfaRequired()) return true;
  return getTokenAal(token) === 'aal2';
}
