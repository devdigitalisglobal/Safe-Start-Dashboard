import { PageHeader } from '@/components/PageHeader';
import { PortalUserDetailForm } from '@/components/PortalUserDetailForm';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import { organisationTeamCrumbs } from '@/lib/cmsBreadcrumbs';
import type {
  AdminPartnersResponse,
  AdminPortalUser,
  AdminSchoolsResponse,
} from '@/lib/types/admin';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const { token } = await requireStaffUser();

  const [user, schoolsData, partnersData] = await Promise.all([
    apiGetAdmin<AdminPortalUser>(`users/${id}`, token),
    apiGetAdmin<AdminSchoolsResponse>('schools', token),
    apiGetAdmin<AdminPartnersResponse>('partners', token),
  ]);

  return (
    <>
      <PageHeader
        title={user.fullName}
        description={user.email}
        breadcrumbs={[...organisationTeamCrumbs(), { label: user.fullName }]}
      />

      <PortalUserDetailForm
        user={user}
        schools={schoolsData.schools}
        partners={partnersData.partners}
      />
    </>
  );
}
