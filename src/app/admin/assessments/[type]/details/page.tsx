import { PageHeader } from '@/components/PageHeader';
import { AssessmentEditForm } from '@/components/AssessmentEditForm';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import { contentAssessmentsCrumbs, formatAssessmentType } from '@/lib/cmsBreadcrumbs';
import type { AdminAssessmentDetailResponse } from '@/lib/types/admin';

type Props = {
  params: Promise<{ type: string }>;
};

export default async function AdminAssessmentDetailsPage({ params }: Props) {
  const { type } = await params;
  const { token } = await requireStaffUser();
  const data = await apiGetAdmin<AdminAssessmentDetailResponse>(`assessments/${type}`, token);
  const assessmentLabel = formatAssessmentType(data.assessment.type);

  return (
    <>
      <PageHeader
        title={`${assessmentLabel} intro`}
        description="Edit the intro copy and hero image learners see before the questions."
        breadcrumbs={[
          ...contentAssessmentsCrumbs(),
          { label: assessmentLabel, href: `/admin/assessments/${type}` },
          { label: 'Intro' },
        ]}
      />

      <AssessmentEditForm assessment={data.assessment} />
    </>
  );
}
