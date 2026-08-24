import { clearPortalSession } from '@/lib/sessionPolicy';
import { createClient } from '@/lib/supabase/client';

/** Clear portal session markers and revoke Supabase auth (all devices by default). */
export async function signOutPortal(scope: 'global' | 'local' = 'global') {
  clearPortalSession();
  const supabase = createClient();
  await supabase.auth.signOut({ scope });
}
