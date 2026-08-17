import { PageHeader } from '@/components/PageHeader';
import { QuestionEditForm } from '@/components/QuestionEditForm';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import type { AdminKnowledgeAreasResponse, AdminQuestionsResponse } from '@/lib/types/admin';

type Props = {
  params: Promise<{ type: string; id: string }>;
};

export default async function AdminQuestionEditPage({ params }: Props) {
  const { type, id } = await params;
  const { token } = await requireStaffUser();

  const [questionsData, areasData] = await Promise.all([
    apiGetAdmin<AdminQuestionsResponse>(`assessments/${type}/questions`, token),
    apiGetAdmin<AdminKnowledgeAreasResponse>('assessments/knowledge-areas', token),
  ]);

  const question = questionsData.questions.find((q) => q.id === id);
  if (!question) {
    return (
      <PageHeader
        title="Question not found"
        description="This question may have been removed. Go back to the assessment question list."
        backHref={`/admin/assessments/${type}`}
        backLabel="Question list"
      />
    );
  }

  return (
    <>
      <PageHeader
        title={`Question ${question.orderIndex}`}
        description={questionsData.assessment.title}
        backHref={`/admin/assessments/${type}`}
        backLabel="Question list"
      />

      <QuestionEditForm question={question} knowledgeAreas={areasData.knowledgeAreas} />
    </>
  );
}
