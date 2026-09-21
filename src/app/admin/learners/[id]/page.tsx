import { LearnerDetailActions } from '@/components/LearnerDetailActions';
import { PageHeader } from '@/components/PageHeader';
import { fetchAdminApi, requireSuperAdminUser } from '@/lib/auth';
import { organisationLearnersCrumbs } from '@/lib/cmsBreadcrumbs';
import type { AdminLearnerDetail } from '@/lib/types/admin';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminLearnerDetailPage({ params }: Props) {
  const { id } = await params;
  const { token } = await requireSuperAdminUser();
  const learner = await fetchAdminApi<AdminLearnerDetail>(`learners/${id}`, token);

  return (
    <>
      <PageHeader
        title={learner.fullName}
        description={learner.email}
        breadcrumbs={[...organisationLearnersCrumbs(), { label: learner.fullName }]}
      />

      <LearnerDetailActions learner={learner} />
    </>
  );
}
