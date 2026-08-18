import Link from 'next/link';
import { AccountSecurityPanel } from '@/components/AccountSecurityPanel';
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
        <AccountSecurityPanel mfaRequired={mfaRequired} />
      </div>
    </div>
  );
}
