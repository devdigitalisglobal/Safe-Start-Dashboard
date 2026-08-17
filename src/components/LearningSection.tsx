import { MetricTile } from '@/components/MetricTile';
import { Section } from '@/components/Section';
import { SuppressedNotice } from '@/components/SuppressedNotice';
import { formatPercent } from '@/lib/filters';
import type { LearningResponse } from '@/lib/types/dashboard';
import styles from './LearningSection.module.css';

type Props = {
  data: LearningResponse | null;
};

function formatAssessmentType(type: string) {
  return type === 'starting_grid' ? 'Starting Grid' : type === 'finish_line' ? 'Finish Line' : type;
}

export function LearningSection({ data }: Props) {
  return (
    <Section
      title="Learning"
      description="Assessment scores, most-missed questions, and re-attempt rate."
    >
      {!data ? (
        <p className={styles.placeholder}>Unable to load learning data.</p>
      ) : data.suppressed ? (
        <SuppressedNotice reason={data.reason} />
      ) : (
        <>
          {data.scores?.suppressed ? (
            <SuppressedNotice reason={data.scores.reason} />
          ) : data.scores ? (
            <div className={styles.tiles}>
              <MetricTile
                label="Starting Grid (paired)"
                value={formatPercent(data.scores.startingGrid)}
              />
              <MetricTile
                label="Finish Line (paired)"
                value={formatPercent(data.scores.finishLine)}
              />
              <MetricTile
                label="Improvement"
                value={formatPercent(data.scores.improvement, true)}
              />
              <MetricTile label="Paired students" value={data.scores.pairedStudents} />
            </div>
          ) : null}

          <article className={styles.note}>
            <h3 className={styles.noteTitle}>Pass rate</h3>
            <p className={styles.noteBody}>{data.passRate.note}</p>
          </article>

          {data.reAttempt ? (
            <div className={styles.tiles}>
              <MetricTile
                label="Re-attempt rate"
                value={formatPercent(data.reAttempt.ratePercent)}
              />
              <MetricTile
                label="Students with re-attempt"
                value={data.reAttempt.studentsWithReAttempt}
              />
              <MetricTile label="Students started" value={data.reAttempt.studentsStarted} />
            </div>
          ) : null}

          {data.mostMissed?.suppressed ? (
            <SuppressedNotice reason={data.mostMissed.reason} />
          ) : data.mostMissed?.questions?.length ? (
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Assessment</th>
                    <th>Area</th>
                    <th>Miss rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mostMissed.questions.map((question) => (
                    <tr key={question.questionId}>
                      <td className={styles.question}>{question.text}</td>
                      <td>{formatAssessmentType(question.assessmentType)}</td>
                      <td>{question.knowledgeArea}</td>
                      <td>
                        {question.missRatePercent}% ({question.missCount}/{question.answerCount})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.placeholder}>No missed-question data yet.</p>
          )}
        </>
      )}
    </Section>
  );
}
