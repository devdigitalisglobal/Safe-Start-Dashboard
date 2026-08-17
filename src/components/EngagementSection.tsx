import { MetricTile } from '@/components/MetricTile';
import { Section } from '@/components/Section';
import { SuppressedNotice } from '@/components/SuppressedNotice';
import { formatDuration, formatPercent } from '@/lib/filters';
import type { EngagementResponse } from '@/lib/types/dashboard';
import styles from './EngagementSection.module.css';

type Props = {
  data: EngagementResponse | null;
};

export function EngagementSection({ data }: Props) {
  return (
    <Section
      title="Engagement"
      description="Module starts, completions, drop-off, and popularity."
    >
      {!data ? (
        <p className={styles.placeholder}>Unable to load engagement data.</p>
      ) : data.suppressed ? (
        <SuppressedNotice reason={data.reason} />
      ) : data.summary ? (
        <>
          <div className={styles.tiles}>
            <MetricTile label="Modules started" value={data.summary.modulesStarted} />
            <MetricTile label="Modules completed" value={data.summary.modulesCompleted} />
            <MetricTile
              label="Program completion"
              value={formatPercent(data.summary.programCompletionRate)}
            />
            <MetricTile
              label="Avg modules / student"
              value={data.summary.averageModulesPerStudent}
            />
            <MetricTile
              label="Avg time / module"
              value={formatDuration(data.summary.averageTimePerModuleSeconds)}
            />
          </div>

          {data.byModule?.length ? (
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>Started</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byModule.map((module) => (
                    <tr key={module.moduleId}>
                      <td>
                        {module.orderIndex}. {module.title}
                      </td>
                      <td>{module.started}</td>
                      <td>{module.completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className={styles.meta}>
            {data.dropOff ? (
              <article className={styles.card}>
                <h3 className={styles.cardTitle}>Drop-off point</h3>
                <p className={styles.cardBody}>
                  Module {data.dropOff.moduleOrderIndex}: {data.dropOff.moduleTitle} — step{' '}
                  {data.dropOff.stepIndex + 1} ({data.dropOff.lessonHeading}).{' '}
                  {data.dropOff.dropCount} fewer views to the next step (
                  {data.dropOff.dropPercent}% drop).
                </p>
              </article>
            ) : null}

            {data.popularity?.most || data.popularity?.least ? (
              <article className={styles.card}>
                <h3 className={styles.cardTitle}>Module popularity</h3>
                {data.popularity.most ? (
                  <p className={styles.cardBody}>
                    Most started: {data.popularity.most.title} ({data.popularity.most.starts}{' '}
                    starts)
                  </p>
                ) : null}
                {data.popularity.least ? (
                  <p className={styles.cardBody}>
                    Least started: {data.popularity.least.title} ({data.popularity.least.starts}{' '}
                    starts)
                  </p>
                ) : null}
              </article>
            ) : null}
          </div>
        </>
      ) : (
        <p className={styles.placeholder}>No engagement data available.</p>
      )}
    </Section>
  );
}
