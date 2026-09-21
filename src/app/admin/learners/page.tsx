import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { fetchAdminApi, requireSuperAdminUser } from '@/lib/auth';
import { organisationLearnersCrumbs } from '@/lib/cmsBreadcrumbs';
import type { AdminLearnersResponse, AdminSchoolsResponse } from '@/lib/types/admin';
import styles from '../modules/page.module.css';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : undefined;
}

function statusLabel(status: string) {
  if (status === 'suspended') return 'Suspended';
  if (status === 'deleted') return 'Deleted';
  return 'Active';
}

export default async function AdminLearnersPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = pickParam(params.q) ?? '';
  const schoolId = pickParam(params.schoolId) ?? '';
  const status = pickParam(params.status) ?? '';
  const page = pickParam(params.page) ?? '1';

  const query = new URLSearchParams({ limit: '25', page });
  if (q) query.set('q', q);
  if (schoolId) query.set('schoolId', schoolId);
  if (status === 'active' || status === 'suspended' || status === 'deleted') {
    query.set('status', status);
  }

  const { token } = await requireSuperAdminUser();
  const [data, schoolsData] = await Promise.all([
    fetchAdminApi<AdminLearnersResponse>(`learners?${query}`, token),
    fetchAdminApi<AdminSchoolsResponse>('schools', token),
  ]);

  const hasFilters = Boolean(q || schoolId || status);

  return (
    <>
      <PageHeader
        title="App users"
        description="Learner accounts in the mobile app. Suspend, reset passwords, or permanently delete."
        breadcrumbs={organisationLearnersCrumbs()}
      />

      <form className={styles.filters} method="get">
        <label className={styles.filterLabel}>
          Search
          <input
            className={styles.filterInput}
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Name or email"
          />
        </label>
        <label className={styles.filterLabel}>
          School
          <select className={styles.filterInput} name="schoolId" defaultValue={schoolId}>
            <option value="">All schools</option>
            {schoolsData.schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filterLabel}>
          Status
          <select className={styles.filterInput} name="status" defaultValue={status}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
          </select>
        </label>
        <button type="submit" className={styles.filterButton}>
          Apply filters
        </button>
      </form>

      {data.learners.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No matching learners' : 'No learners yet'}
          description={
            hasFilters
              ? 'Try a different search or clear filters.'
              : 'Learners appear here after they sign up in the mobile app.'
          }
        />
      ) : (
        <>
          <p className={styles.intro}>
            Showing {data.learners.length} of {data.total} learner
            {data.total === 1 ? '' : 's'}
            {data.totalPages > 1 ? ` · Page ${data.page} of ${data.totalPages}` : ''}
          </p>

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>School</th>
                  <th>Registered</th>
                  <th>Last active</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.learners.map((learner) => (
                  <tr key={learner.id}>
                    <td>{learner.fullName}</td>
                    <td>{learner.email}</td>
                    <td>{learner.schoolName ?? '—'}</td>
                    <td>{new Date(learner.registeredAt).toLocaleDateString('en-AU')}</td>
                    <td>
                      {learner.lastActiveAt
                        ? new Date(learner.lastActiveAt).toLocaleDateString('en-AU')
                        : '—'}
                    </td>
                    <td className={styles.status}>{statusLabel(learner.status)}</td>
                    <td>
                      <Link className={styles.link} href={`/admin/learners/${learner.id}`}>
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 ? (
            <div className={styles.introActions}>
              {data.page > 1 ? (
                <Link
                  className={styles.secondaryButton}
                  href={`/admin/learners?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(schoolId ? { schoolId } : {}),
                    ...(status ? { status } : {}),
                    page: String(data.page - 1),
                  }).toString()}`}
                >
                  Previous
                </Link>
              ) : null}
              {data.page < data.totalPages ? (
                <Link
                  className={styles.secondaryButton}
                  href={`/admin/learners?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(schoolId ? { schoolId } : {}),
                    ...(status ? { status } : {}),
                    page: String(data.page + 1),
                  }).toString()}`}
                >
                  Next
                </Link>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
