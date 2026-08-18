import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import type { AdminQuestionsResponse } from '@/lib/types/admin';
import styles from '../../modules/page.module.css';

type Props = {
  params: Promise<{ type: string }>;
};

function formatType(type: string) {
  return type === 'starting_grid' ? 'Starting Grid' : 'Finish Line';
}

export default async function AdminAssessmentQuestionsPage({ params }: Props) {
  const { type } = await params;
  const { token } = await requireStaffUser();
  const data = await apiGetAdmin<AdminQuestionsResponse>(`assessments/${type}/questions`, token);

  return (
    <>
      <PageHeader
        title={`${formatType(data.assessment.type)} questions`}
        description={data.assessment.title}
        backHref="/admin/assessments"
        backLabel="All assessments"
      />

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
            {data.questions.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <p className={styles.intro}>No questions yet. Use Add question to create the first one.</p>
                </td>
              </tr>
            ) : (
              data.questions.map((question) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
