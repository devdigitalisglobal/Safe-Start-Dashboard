import Link from 'next/link';
import { AuditExportButton } from '@/components/AuditExportButton';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import type { AdminAuditResponse } from '@/lib/types/admin';
import styles from '../modules/page.module.css';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function formatEventType(type: string) {
  return type.replace(/^admin_/, '').replace(/_/g, ' ');
}

function pickParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : undefined;
}

export default async function AdminAuditPage({ searchParams }: Props) {
  const params = await searchParams;
  const from = pickParam(params.from);
  const to = pickParam(params.to);
  const type = pickParam(params.type);
  const hasFilters = Boolean(from || to || type);

  const query = new URLSearchParams({ limit: '100' });
  if (from) query.set('from', from);
  if (to) query.set('to', to);
  if (type) query.set('type', type);

  const { token } = await requireStaffUser();
  const data = await apiGetAdmin<AdminAuditResponse>(`audit?${query}`, token);

  return (
    <>
      <PageHeader
        title="Audit log"
        description="A record of staff changes to content, schools, and invitations. Export for compliance or internal review."
        breadcrumbs={[
          { label: 'System', href: '/admin/audit' },
          { label: 'Audit log' },
        ]}
      />

      <AuditExportButton from={from} to={to} type={type} />

      <form className={styles.filters} method="get">
        <label className={styles.filterLabel}>
          From
          <input className={styles.filterInput} type="date" name="from" defaultValue={from} />
        </label>
        <label className={styles.filterLabel}>
          To
          <input className={styles.filterInput} type="date" name="to" defaultValue={to} />
        </label>
        <label className={styles.filterLabel}>
          Action
          <select className={styles.filterInput} name="type" defaultValue={type ?? ''}>
            <option value="">All admin actions</option>
            <option value="admin_module_updated">Module updated</option>
            <option value="admin_module_created">Module created</option>
            <option value="admin_module_deleted">Module deleted</option>
            <option value="admin_module_submitted_review">Submitted for review</option>
            <option value="admin_module_approved">Module approved</option>
            <option value="admin_module_rejected">Module rejected</option>
            <option value="admin_module_published">Module published</option>
            <option value="admin_portal_user_created">Portal user created</option>
            <option value="admin_mfa_reset">MFA reset</option>
            <option value="admin_school_created">School created</option>
            <option value="admin_invitation_sent">Invitation sent</option>
            <option value="admin_lesson_updated">Lesson updated</option>
            <option value="admin_lesson_created">Lesson created</option>
            <option value="admin_lesson_deleted">Lesson deleted</option>
          </select>
        </label>
        <button type="submit" className={styles.filterButton}>
          Apply filters
        </button>
      </form>

      {data.events.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No matching events' : 'No admin actions yet'}
          description={
            hasFilters
              ? 'Try widening your date range or choosing a different action type.'
              : 'Staff changes to modules, schools, team accounts, and MFA will appear here.'
          }
          secondaryAction={hasFilters ? { label: 'Clear filters', href: '/admin/audit' } : undefined}
        />
      ) : (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>Staff member</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {data.events.map((event) => (
                <tr key={event.id}>
                  <td>{new Date(event.occurredAt).toLocaleString('en-AU')}</td>
                  <td>{formatEventType(event.type)}</td>
                  <td>{event.actor?.fullName ?? '—'}</td>
                  <td>
                    <code className={styles.code}>{JSON.stringify(event.payload)}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
