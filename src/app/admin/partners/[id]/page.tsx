import { PageHeader } from '@/components/PageHeader';
import { PartnerApiCredentials } from '@/components/PartnerApiCredentials';
import { PartnerBrandingForm } from '@/components/PartnerBrandingForm';
import { fetchAdminApi, requireStaffUser } from '@/lib/auth';
import { organisationPartnersCrumbs } from '@/lib/cmsBreadcrumbs';
import type { AdminPartnerCredentialsResponse, AdminPartnerDetail } from '@/lib/types/admin';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminPartnerDetailPage({ params }: Props) {
  const { id } = await params;
  const { token } = await requireStaffUser();
  const [partner, credentialsData] = await Promise.all([
    fetchAdminApi<AdminPartnerDetail>(`partners/${id}`, token),
    fetchAdminApi<AdminPartnerCredentialsResponse>(`partners/${id}/credentials`, token),
  ]);

  return (
    <>
      <PageHeader
        title={partner.name}
        description={`Slug: ${partner.slug}${partner.isDefault ? ' · default partner' : ''}`}
        breadcrumbs={[...organisationPartnersCrumbs(), { label: partner.name }]}
      />
      <PartnerBrandingForm partner={partner} />
      <PartnerApiCredentials partnerId={partner.id} credentials={credentialsData.credentials} />
    </>
  );
}
