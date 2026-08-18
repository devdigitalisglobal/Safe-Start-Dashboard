import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import { roleLabel } from '@/lib/roles';
import type { AdminPortalUsersResponse } from '@/lib/types/admin';
import styles from '../modules/page.module.css';

export default async function AdminUsersPage() {
  const { token } = await requireStaffUser();
  const data = await apiGetAdmin<AdminPortalUsersResponse>('users', token);

  return (
    <>
      <PageHeader
        title="Team"
        description="Portal users who can sign in to reporting and content tools. Invite and manage access — full provisioning ships in Phase 1."
      />

      <div className={styles.introActions}>
        <Link href="/admin/users/new" className={styles.primaryButton}>
          Invite user
        </Link>
      </div>

      {data.users.length === 0 ? (
        <div className={styles.notice}>
          <p>No portal users yet besides seeded dev accounts. Use Invite user to add staff, partners,
          school admins, or reviewers.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Scope</th>
                <th>Last active</th>
                <th>MFA</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{roleLabel(user.role)}</td>
                  <td>{user.schoolName ?? user.partnerName ?? '—'}</td>
                  <td>
                    {user.lastActiveAt
                      ? new Date(user.lastActiveAt).toLocaleDateString('en-AU')
                      : '—'}
                  </td>
                  <td>{user.mfaEnrolled === null ? '—' : user.mfaEnrolled ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
