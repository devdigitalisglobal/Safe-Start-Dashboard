import { PageHeader } from '@/components/PageHeader';
import { QuestionCreateForm } from '@/components/QuestionCreateForm';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import type {
  AdminKnowledgeAreasResponse,
  AdminModulesResponse,
  AdminQuestionsResponse,
} from '@/lib/types/admin';

type Props = {
  params: Promise<{ type: string }>;
};

function formatType(type: string) {
  return type === 'starting_grid' ? 'Starting Grid' : 'Finish Line';
}

export default async function AdminQuestionCreatePage({ params }: Props) {
  const { type } = await params;
  const { token } = await requireStaffUser();

  const [questionsData, areasData, modulesData] = await Promise.all([
    apiGetAdmin<AdminQuestionsResponse>(`assessments/${type}/questions`, token),
    apiGetAdmin<AdminKnowledgeAreasResponse>('assessments/knowledge-areas', token),
    apiGetAdmin<AdminModulesResponse>('modules', token),
  ]);

  return (
    <>
      <PageHeader
        title={`New ${formatType(type)} question`}
        description={questionsData.assessment.title}
        backHref={`/admin/assessments/${type}`}
        backLabel="Question list"
      />

      <QuestionCreateForm
        assessmentType={type}
        knowledgeAreas={areasData.knowledgeAreas}
        modules={modulesData.modules}
      />
    </>
  );
}
