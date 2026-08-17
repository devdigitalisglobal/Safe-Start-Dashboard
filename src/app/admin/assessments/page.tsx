import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import type { AdminAssessmentsResponse } from '@/lib/types/admin';
import styles from '../modules/page.module.css';

function formatType(type: string) {
  return type === 'starting_grid' ? 'Starting Grid' : 'Finish Line';
}

export default async function AdminAssessmentsPage() {
  const { token } = await requireStaffUser();
  const data = await apiGetAdmin<AdminAssessmentsResponse>('assessments', token);

  return (
    <>
      <PageHeader
        title="Assessments"
        description="Edit knowledge-check questions and tags. Correct answers stay in this portal only — never in the learner app."
      />

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Assessment</th>
              <th>Questions</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.assessments.map((assessment) => (
              <tr key={assessment.id}>
                <td>
                  <strong>{formatType(assessment.type)}</strong>
                  <br />
                  <span className={styles.status}>{assessment.title}</span>
                </td>
                <td>{assessment.questionCount}</td>
                <td>{assessment.status}</td>
                <td>
                  <Link className={styles.link} href={`/admin/assessments/${assessment.type}`}>
                    Edit questions
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
