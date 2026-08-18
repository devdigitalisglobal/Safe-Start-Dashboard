import { PageHeader } from '@/components/PageHeader';
import { QuestionCreateForm } from '@/components/QuestionCreateForm';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
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
    apiGetAdmin<AdminQuestionsResponse>(`assessments/${type}/questions`, token),
    apiGetAdmin<AdminKnowledgeAreasResponse>('assessments/knowledge-areas', token),
    apiGetAdmin<AdminModulesResponse>('modules', token),
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
