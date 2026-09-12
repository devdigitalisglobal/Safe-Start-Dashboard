import { PageHeader } from '@/components/PageHeader';
import { QuestionCreateForm } from '@/components/QuestionCreateForm';
import { fetchAdminApi, requireStaffUser } from '@/lib/auth';
import {
  contentAssessmentsCrumbs,
  formatAssessmentType,
} from '@/lib/cmsBreadcrumbs';
import type {
  AdminKnowledgeAreasResponse,
  AdminModulesResponse,
  AdminQuestionsResponse,
} from '@/lib/types/admin';

type Props = {
  params: Promise<{ type: string }>;
};

export default async function AdminQuestionCreatePage({ params }: Props) {
  const { type } = await params;
  const { token } = await requireStaffUser();

  const [questionsData, areasData, modulesData] = await Promise.all([
    fetchAdminApi<AdminQuestionsResponse>(`assessments/${type}/questions`, token),
    fetchAdminApi<AdminKnowledgeAreasResponse>('assessments/knowledge-areas', token),
    fetchAdminApi<AdminModulesResponse>('modules', token),
  ]);

  const assessmentLabel = formatAssessmentType(type);

  return (
    <>
      <PageHeader
        title={`New ${assessmentLabel} question`}
        description={questionsData.assessment.title}
        breadcrumbs={[
          ...contentAssessmentsCrumbs(),
          { label: assessmentLabel, href: `/admin/assessments/${type}` },
          { label: 'New question' },
        ]}
      />

      <QuestionCreateForm
        assessmentType={type}
        knowledgeAreas={areasData.knowledgeAreas}
        modules={modulesData.modules}
      />
    </>
  );
}
