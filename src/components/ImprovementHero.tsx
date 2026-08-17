import { MetricTile } from '@/components/MetricTile';
import { Section } from '@/components/Section';
import { SuppressedNotice } from '@/components/SuppressedNotice';
import { formatPercent } from '@/lib/filters';
import type { ImprovementResponse } from '@/lib/types/dashboard';
import styles from './ImprovementHero.module.css';

type Props = {
  data: ImprovementResponse | null;
};

export function ImprovementHero({ data }: Props) {
  return (
    <Section
      title="Knowledge improvement"
      description="Starting Grid vs Finish Line by knowledge area — the headline KPI."
    >
      {!data ? (
        <p className={styles.placeholder}>Unable to load improvement data.</p>
      ) : data.suppressed ? (
        <SuppressedNotice reason={data.reason} />
      ) : data.overall ? (
        <>
          <div className={styles.hero}>
            <MetricTile
              label="Starting Grid"
              value={formatPercent(data.overall.startingGrid)}
            />
            <MetricTile
              label="Finish Line"
              value={formatPercent(data.overall.finishLine)}
            />
            <MetricTile
              label="Overall improvement"
              value={formatPercent(data.overall.improvement, true)}
            />
            <MetricTile label="Students (paired cohort)" value={data.studentCount} />
          </div>

          {data.knowledgeAreas?.length ? (
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Knowledge area</th>
                    <th>Starting Grid</th>
                    <th>Finish Line</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {data.knowledgeAreas.map((area) => (
                    <tr key={area.key}>
                      <td>{area.name}</td>
                      <td>{area.startingGrid ?? '—'}%</td>
                      <td>{area.finishLine ?? '—'}%</td>
                      <td className={styles.change}>
                        {area.improvement !== null
                          ? formatPercent(area.improvement, true)
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      ) : (
        <p className={styles.placeholder}>No improvement data available.</p>
      )}
    </Section>
  );
}
