import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { requireStaffUser } from '@/lib/auth';
import styles from '../../modules/page.module.css';

export default async function AdminUsersNewPage() {
  await requireStaffUser();

  return (
    <>
      <PageHeader
        title="Invite portal user"
        description="Create staff, partner, school admin, or reviewer accounts."
        backHref="/admin/users"
        backLabel="Team"
      />

      <div className={styles.notice}>
        <p>
          <strong>Phase 1</strong> will add the invite form, role picker, and school/partner linking.
        </p>
        <p style={{ marginTop: 12 }}>
          Until then, use <code>npm run seed:dashboard-users</code> in the API repo for dev accounts,
          or create users manually in Supabase Auth and set the <code>role</code> on the profile row.
        </p>
        <p style={{ marginTop: 12 }}>
          <Link href="/admin/users" className={styles.link}>
            ← Back to Team
          </Link>
        </p>
      </div>
    </>
  );
}
