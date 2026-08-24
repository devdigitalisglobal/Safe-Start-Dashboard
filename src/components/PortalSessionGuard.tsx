'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { signOutPortal } from '@/lib/portalSignOut';
import {
  getSessionExpiryReason,
  readPortalSession,
  touchPortalSession,
} from '@/lib/sessionPolicy';
import { createClient } from '@/lib/supabase/client';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const;
const CHECK_INTERVAL_MS = 60_000;
const ACTIVITY_THROTTLE_MS = 30_000;

type Props = {
  children: React.ReactNode;
};

function throttle(fn: () => void, ms: number) {
  let last = 0;
  return () => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn();
    }
  };
}

/** Signs out on missing browser session, idle timeout, or absolute session cap. */
export function PortalSessionGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const signingOut = useRef(false);

  const isMfaFlow = pathname.startsWith('/account/mfa');

  const expireSession = useCallback(async () => {
    if (signingOut.current) return;
    signingOut.current = true;
    await signOutPortal();
    router.replace('/login?reason=session_expired');
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (isMfaFlow) return;

    async function checkSession() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const reason = getSessionExpiryReason(readPortalSession());
      if (reason) {
        await expireSession();
      }
    }

    void checkSession();

    const onActivity = throttle(() => touchPortalSession(), ACTIVITY_THROTTLE_MS);
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: true })
    );

    const interval = window.setInterval(() => {
      void checkSession();
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, onActivity));
      window.clearInterval(interval);
    };
  }, [expireSession, isMfaFlow]);

  return <>{children}</>;
}
