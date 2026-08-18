import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import { contentAssessmentsCrumbs, formatAssessmentType } from '@/lib/cmsBreadcrumbs';
import type { AdminQuestionsResponse } from '@/lib/types/admin';
import styles from '../../modules/page.module.css';

type Props = {
  params: Promise<{ type: string }>;
};

export default async function AdminAssessmentQuestionsPage({ params }: Props) {
  const { type } = await params;
  const { token } = await requireStaffUser();
  const data = await apiGetAdmin<AdminQuestionsResponse>(`assessments/${type}/questions`, token);
  const assessmentLabel = formatAssessmentType(data.assessment.type);

  return (
    <>
      <PageHeader
        title={`${assessmentLabel} questions`}
        description={data.assessment.title}
        breadcrumbs={[
          ...contentAssessmentsCrumbs(),
          { label: assessmentLabel, href: `/admin/assessments/${type}` },
          { label: 'Questions' },
        ]}
      />

      {data.questions.length === 0 ? (
        <EmptyState
          title="No questions yet"
          description="Add knowledge-check questions for this assessment. Correct answers stay in the portal only — never in the learner app."
          action={{ label: 'Add question', href: `/admin/assessments/${type}/questions/new` }}
          secondaryAction={{ label: 'All assessments', href: '/admin/assessments' }}
        />
      ) : (
        <>
          <div className={styles.introActions}>
            <Link className={styles.primaryButton} href={`/admin/assessments/${type}/questions/new`}>
              Add question
            </Link>
          </div>

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Question</th>
                  <th>Knowledge area</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.questions.map((question) => (
                  <tr key={question.id}>
                    <td>{question.orderIndex}</td>
                    <td>{question.text}</td>
                    <td>{question.knowledgeArea.name}</td>
                    <td>
                      <Link
                        className={styles.link}
                        href={`/admin/assessments/${type}/questions/${question.id}`}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
