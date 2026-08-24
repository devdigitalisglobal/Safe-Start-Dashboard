export const PORTAL_SESSION_STORAGE_KEY = 'ss_portal_session';

export type PortalSessionRecord = {
  startedAt: number;
  lastActivityAt: number;
};

export type SessionExpiryReason = 'idle' | 'absolute' | 'missing';

const DEFAULT_IDLE_MS = 30 * 60 * 1000;
const DEFAULT_ABSOLUTE_MS = 8 * 60 * 60 * 1000;

/** Inactivity sign-out (default 30 minutes). */
export function getSessionIdleMs(): number {
  const raw = process.env.NEXT_PUBLIC_SESSION_IDLE_MS;
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_IDLE_MS;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_IDLE_MS;
}

/** Maximum signed-in duration (default 8 hours). Auth cookies use the same cap. */
export function getSessionAbsoluteMs(): number {
  const raw = process.env.NEXT_PUBLIC_SESSION_ABSOLUTE_MS;
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_ABSOLUTE_MS;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_ABSOLUTE_MS;
}

export function getSessionCookieMaxAgeSeconds(): number {
  return Math.ceil(getSessionAbsoluteMs() / 1000);
}

export function readPortalSession(): PortalSessionRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PORTAL_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PortalSessionRecord;
    if (typeof parsed.startedAt !== 'number' || typeof parsed.lastActivityAt !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function beginPortalSession(): void {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const record: PortalSessionRecord = { startedAt: now, lastActivityAt: now };
  sessionStorage.setItem(PORTAL_SESSION_STORAGE_KEY, JSON.stringify(record));
}

export function touchPortalSession(): void {
  if (typeof window === 'undefined') return;
  const existing = readPortalSession();
  const now = Date.now();
  if (existing) {
    sessionStorage.setItem(
      PORTAL_SESSION_STORAGE_KEY,
      JSON.stringify({ ...existing, lastActivityAt: now })
    );
  }
}

export function clearPortalSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PORTAL_SESSION_STORAGE_KEY);
}

export function getSessionExpiryReason(
  record: PortalSessionRecord | null
): SessionExpiryReason | null {
  if (!record) return 'missing';
  const now = Date.now();
  if (now - record.lastActivityAt > getSessionIdleMs()) return 'idle';
  if (now - record.startedAt > getSessionAbsoluteMs()) return 'absolute';
  return null;
}
