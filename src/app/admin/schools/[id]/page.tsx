import { PageHeader } from '@/components/PageHeader';
import { SchoolInviteForm } from '@/components/SchoolInviteForm';
import { SchoolPartnerForm } from '@/components/SchoolPartnerForm';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import type { AdminPartnersResponse, AdminSchoolInvitationsResponse } from '@/lib/types/admin';
import styles from '../../modules/page.module.css';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminSchoolDetailPage({ params }: Props) {
  const { id } = await params;
  const { token } = await requireStaffUser();
  const [data, partnersData] = await Promise.all([
    apiGetAdmin<AdminSchoolInvitationsResponse>(`schools/${id}/invitations`, token),
    apiGetAdmin<AdminPartnersResponse>('partners', token),
  ]);

  return (
    <>
      <PageHeader
        title={data.school.name}
        description={`School invite code: ${data.school.inviteCode}. Send email invitations or share this code for student signup.`}
        backHref="/admin/schools"
        backLabel="All schools"
      />

      <SchoolPartnerForm
        schoolId={data.school.id}
        partnerId={data.school.partnerId}
        partners={partnersData.partners}
      />

      <SchoolInviteForm schoolId={data.school.id} />

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Sent</th>
              <th>Accepted</th>
              <th>Expires</th>
            </tr>
          </thead>
          <tbody>
            {data.invitations.map((invitation) => (
              <tr key={invitation.id}>
                <td>{invitation.email}</td>
                <td>{new Date(invitation.sentAt).toLocaleDateString('en-AU')}</td>
                <td>
                  {invitation.acceptedAt
                    ? new Date(invitation.acceptedAt).toLocaleDateString('en-AU')
                    : '—'}
                </td>
                <td>{new Date(invitation.expiresAt).toLocaleDateString('en-AU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
