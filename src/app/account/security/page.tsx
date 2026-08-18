import Link from 'next/link';
import { isDashboardRole } from '@/lib/access';
import { requirePortalUser } from '@/lib/auth';
import { isPortalMfaRequired } from '@/lib/mfa';
import styles from '../account.module.css';

export default async function AccountSecurityPage() {
  const { profile } = await requirePortalUser();
  const homeHref = isDashboardRole(profile.role) ? '/' : '/admin/modules';

  return (
    <>
      <Link href={homeHref} className={styles.back}>
        ← Back to portal
      </Link>
      <p className={styles.eyebrow}>Account</p>
      <h1 className={styles.title}>Security</h1>
      <p className={styles.body}>
        Signed in as <strong>{profile.email}</strong> ({profile.fullName}).
      </p>

      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Authenticator app (MFA)</h2>
        <p className={styles.panelBody}>
          {isPortalMfaRequired()
            ? 'Multi-factor authentication is required for Staff Portal access. Recovery codes and device replacement ship in Phase 2.'
            : 'MFA is disabled in this environment (NEXT_PUBLIC_REQUIRE_PORTAL_MFA=false).'}
        </p>
        {isPortalMfaRequired() ? (
          <p className={styles.panelBody} style={{ marginTop: 8 }}>
            <Link href="/account/mfa" className={styles.link}>
              Open MFA setup / verification
            </Link>
          </p>
        ) : null}
      </div>

      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Lost your authenticator?</h2>
        <p className={styles.panelBody}>
          Contact an Auto Verifi administrator to reset MFA on your account. Self-service recovery
          codes arrive in Phase 2.
        </p>
      </div>
    </>
  );
}
