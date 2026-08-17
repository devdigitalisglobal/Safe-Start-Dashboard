import Link from 'next/link';
import { CreatePartnerForm } from '@/components/CreatePartnerForm';
import { PageHeader } from '@/components/PageHeader';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import type { AdminPartnersResponse } from '@/lib/types/admin';
import styles from '../modules/page.module.css';

export default async function AdminPartnersPage() {
  const { token } = await requireStaffUser();
  const data = await apiGetAdmin<AdminPartnersResponse>('partners', token);

  return (
    <>
      <PageHeader
        title="Partners"
        description="Manage co-branding for NRMA and other partners. Assign a partner to a school so its students see the right logo in the learner app."
      />

      <CreatePartnerForm />

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Default</th>
              <th>Schools</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.partners.length === 0 ? (
              <tr>
                <td colSpan={6}>No partners yet.</td>
              </tr>
            ) : (
              data.partners.map((partner) => (
                <tr key={partner.id}>
                  <td>{partner.name}</td>
                  <td>{partner.slug}</td>
                  <td>{partner.isDefault ? 'Yes' : '—'}</td>
                  <td>{partner.schoolCount}</td>
                  <td>
                    <span className={styles.status}>{partner.status}</span>
                  </td>
                  <td>
                    <Link className={styles.link} href={`/admin/partners/${partner.id}`}>
                      Edit branding
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
