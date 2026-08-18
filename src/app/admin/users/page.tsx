import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { apiGetAdmin } from '@/lib/api';
import { requireSuperAdminUser } from '@/lib/auth';
import { roleLabel } from '@/lib/roles';
import { organisationTeamCrumbs } from '@/lib/cmsBreadcrumbs';
import type { AdminPortalUsersResponse } from '@/lib/types/admin';
import styles from '../modules/page.module.css';

export default async function AdminUsersPage() {
  const { token } = await requireSuperAdminUser();
  const data = await apiGetAdmin<AdminPortalUsersResponse>('users', token);

  return (
    <>
      <PageHeader
        title="Team"
        description="Portal users who can sign in to reporting and content tools."
        breadcrumbs={organisationTeamCrumbs()}
      />

      {data.users.length === 0 ? (
        <EmptyState
          title="No portal users yet"
          description="Invite staff, partners, school admins, or content reviewers. Each user receives a temporary password and must enroll MFA on first login."
          action={{ label: 'Invite user', href: '/admin/users/new' }}
        />
      ) : (
        <>
          <div className={styles.introActions}>
            <Link href="/admin/users/new" className={styles.primaryButton}>
              Invite user
            </Link>
          </div>

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Scope</th>
                  <th>Last active</th>
                  <th>Status</th>
                  <th />
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
                    <td>{user.status === 'deactivated' ? 'Deactivated' : 'Active'}</td>
                    <td>
                      <Link className={styles.link} href={`/admin/users/${user.id}`}>
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
