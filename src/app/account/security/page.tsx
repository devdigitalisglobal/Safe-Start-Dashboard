import Link from 'next/link';
import { isDashboardRole } from '@/lib/access';
import { requirePortalUser } from '@/lib/auth';
import { isPortalMfaRequired } from '@/lib/mfa';
import styles from '../account.module.css';

export default async function AccountSecurityPage() {
  const { profile } = await requirePortalUser();
  const homeHref = isDashboardRole(profile.role) ? '/' : '/admin/modules';
  const mfaRequired = isPortalMfaRequired();

  return (
    <div className={styles.shell}>
      <Link href={homeHref} className={styles.back}>
        ← Back to portal
      </Link>

      <header className={styles.header}>
        <p className={styles.eyebrow}>Account</p>
        <h1 className={styles.title}>Security</h1>
        <p className={styles.subtitle}>
          Signed in as <strong>{profile.email}</strong>
          {profile.fullName ? ` · ${profile.fullName}` : ''}
        </p>
      </header>

      <div className={styles.stack}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Authenticator app (MFA)</h2>
          <p className={styles.panelBody}>
            {mfaRequired
              ? 'Multi-factor authentication is required for Staff Portal access.'
              : 'MFA is disabled in this environment (NEXT_PUBLIC_REQUIRE_PORTAL_MFA=false).'}
          </p>
          {mfaRequired ? (
            <>
              <span className={styles.badge}>Required for all portal roles</span>
              <Link href="/account/mfa" className={styles.link}>
                Open MFA setup / verification →
              </Link>
            </>
          ) : null}
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Lost your authenticator?</h2>
          <p className={styles.panelBody}>
            Contact an Auto Verifi administrator to reset MFA on your account. Self-service
            recovery codes will be available in Phase 2.
          </p>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Coming in Phase 2</h2>
          <p className={styles.panelBody}>
            Backup recovery codes, replace authenticator, and admin MFA reset from the Team page.
          </p>
        </section>
      </div>
    </div>
  );
}
