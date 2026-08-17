import Link from 'next/link';
import { SignOutButton } from '@/components/SignOutButton';
import styles from './Header.module.css';

type Props = {
  userName: string;
  role: string;
  schoolName?: string | null;
  title?: string;
  showAdminLink?: boolean;
  cmsOnly?: boolean;
};

export function Header({
  userName,
  role,
  schoolName,
  title = 'Reporting Dashboard',
  showAdminLink = false,
  cmsOnly = false,
}: Props) {
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>Safe Start for Young Drivers</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.meta}>
          {userName} · {role.replace('_', ' ')}
          {schoolName ? ` · ${schoolName}` : ''}
        </p>
        <nav className={styles.nav} aria-label="Staff navigation">
          {!cmsOnly ? <Link href="/">Reporting</Link> : null}
          {showAdminLink && !cmsOnly ? <Link href="/admin/modules">Content admin</Link> : null}
        </nav>
      </div>
      <SignOutButton />
    </header>
  );
}
