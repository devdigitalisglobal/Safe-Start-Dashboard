import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/LoginForm';
import { ApiError, apiFetch } from '@/lib/api';
import { getSessionToken, isCmsRole, isDashboardRole } from '@/lib/auth';
import { isPortalRole } from '@/lib/access';
import { getTokenAal, isPortalMfaRequired } from '@/lib/mfa';
import type { UserProfile } from '@/lib/types/dashboard';
import styles from './page.module.css';

type Props = {
  searchParams: Promise<{ error?: string; reset?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = await getSessionToken();

  if (token) {
    try {
      const profile = await apiFetch<UserProfile>('/users/me', token);
      if (isPortalMfaRequired() && isPortalRole(profile.role) && getTokenAal(token) !== 'aal2') {
        redirect('/account/mfa');
      }
      if (isDashboardRole(profile.role)) redirect('/');
      if (isCmsRole(profile.role)) redirect('/admin/modules');
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        redirect('/login?error=access_denied');
      }
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Safe Start for Young Drivers</p>
        <h1 className={styles.title}>Staff Portal</h1>
        <p className={styles.subtitle}>
          Sign in to view program reports or manage course content.
        </p>
        <LoginForm
          errorCode={params.error ?? null}
          resetSuccess={params.reset === 'success'}
        />
      </div>
    </main>
  );
}
