import Link from 'next/link';
import styles from './AdminNav.module.css';

type Props = {
  active: 'modules' | 'assessments' | 'schools' | 'audit';
  staffOnly?: boolean;
};

export function AdminNav({ active, staffOnly = true }: Props) {
  return (
    <nav className={styles.nav} aria-label="Content admin sections">
      <Link href="/admin/modules" className={active === 'modules' ? styles.active : undefined}>
        Modules
      </Link>
      {staffOnly ? (
        <>
          <Link
            href="/admin/assessments"
            className={active === 'assessments' ? styles.active : undefined}
          >
            Assessments
          </Link>
          <Link href="/admin/schools" className={active === 'schools' ? styles.active : undefined}>
            Schools
          </Link>
          <Link href="/admin/audit" className={active === 'audit' ? styles.active : undefined}>
            Audit log
          </Link>
        </>
      ) : null}
    </nav>
  );
}
