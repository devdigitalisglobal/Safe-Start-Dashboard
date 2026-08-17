import { redirect } from 'next/navigation';
import { MfaGate } from '@/components/MfaGate';
import { ApiError, apiFetch } from '@/lib/api';
import { getSessionToken } from '@/lib/auth';
import { isDashboardRole, isPortalRole } from '@/lib/access';
import { getTokenAal, isPortalMfaRequired } from '@/lib/mfa';
import type { UserProfile } from '@/lib/types/dashboard';
import styles from '../../login/page.module.css';

export default async function AccountMfaPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  if (!isPortalMfaRequired()) {
    redirect('/');
  }

  let profile: UserProfile;
  try {
    profile = await apiFetch<UserProfile>('/users/me', token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      redirect('/login?error=access_denied');
    }
    redirect('/login?error=api_unreachable');
  }

  if (!isPortalRole(profile.role)) {
    redirect('/login?error=access_denied');
  }

  if (getTokenAal(token) === 'aal2') {
    redirect(isDashboardRole(profile.role) ? '/' : '/admin/modules');
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Safe Start for Young Drivers</p>
        <h1 className={styles.title}>Staff Portal security</h1>
        <MfaGate role={profile.role} email={profile.email} />
      </div>
    </main>
  );
}
