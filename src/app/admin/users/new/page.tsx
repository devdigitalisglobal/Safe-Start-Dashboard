import { PageHeader } from '@/components/PageHeader';
import { InvitePortalUserForm } from '@/components/InvitePortalUserForm';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import type { AdminPartnersResponse, AdminSchoolsResponse } from '@/lib/types/admin';

export default async function AdminUsersNewPage() {
  const { token } = await requireStaffUser();

  const [schoolsData, partnersData] = await Promise.all([
    apiGetAdmin<AdminSchoolsResponse>('schools', token),
    apiGetAdmin<AdminPartnersResponse>('partners', token),
  ]);

  return (
    <>
      <PageHeader
        title="Invite portal user"
        description="Create staff, partner, school admin, or reviewer accounts."
        backHref="/admin/users"
        backLabel="Team"
      />

      <InvitePortalUserForm schools={schoolsData.schools} partners={partnersData.partners} />
    </>
  );
}
