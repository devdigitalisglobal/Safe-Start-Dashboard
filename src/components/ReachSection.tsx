import { MetricTile } from '@/components/MetricTile';
import { Section } from '@/components/Section';
import { SuppressedNotice } from '@/components/SuppressedNotice';
import { formatPercent } from '@/lib/filters';
import type { BreakdownItem, ReachResponse } from '@/lib/types/dashboard';
import styles from './ReachSection.module.css';

type Props = {
  data: ReachResponse | null;
};

function BreakdownTable({
  title,
  items,
  unknown,
}: {
  title: string;
  items: BreakdownItem[];
  unknown: number;
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0) + unknown;
  const rows = [...items, { key: '__unknown', label: 'Not specified', count: unknown }];

  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            <th>{title}</th>
            <th>Learners</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.label}</td>
              <td>{row.count}</td>
              <td>{total > 0 ? `${Math.round((row.count / total) * 100)}%` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReachSection({ data }: Props) {
  return (
    <Section title="Reach" description="Registrations, schools, invite conversion, and MAU.">
      {!data ? (
        <p className={styles.placeholder}>Unable to load reach data.</p>
      ) : (
        <>
          <div className={styles.tiles}>
            <MetricTile
              label="Registered users"
              value={data.registeredUsers.count}
              suppressed={data.registeredUsers.suppressed}
              note={data.registeredUsers.reason}
            />
            <MetricTile label="Schools participating" value={data.schoolsParticipating.count} />
            <MetricTile
              label="Invite → register"
              value={formatPercent(data.inviteToRegister.conversionPercent)}
              suppressed={data.inviteToRegister.suppressed}
              note={
                data.inviteToRegister.suppressed
                  ? data.inviteToRegister.reason
                  : `${data.inviteToRegister.registered} of ${data.inviteToRegister.invited} invited`
              }
            />
            <MetricTile
              label="Monthly active users"
              value={data.monthlyActiveUsers.count}
              suppressed={data.monthlyActiveUsers.suppressed}
              note={data.monthlyActiveUsers.reason}
            />
          </div>

          {!data.appDownloads.available ? (
            <p className={styles.note}>{data.appDownloads.note}</p>
          ) : null}

          <div className={styles.demographics}>
            <h3 className={styles.subheading}>Learner profile</h3>
            {data.demographics.suppressed ? (
              <SuppressedNotice reason={data.demographics.reason} />
            ) : (
              <div className={styles.breakdowns}>
                <BreakdownTable
                  title="Education type"
                  items={data.demographics.educationType.items}
                  unknown={data.demographics.educationType.unknown}
                />
                <BreakdownTable
                  title="Licence status"
                  items={data.demographics.licenceStatus.items}
                  unknown={data.demographics.licenceStatus.unknown}
                />
              </div>
            )}
          </div>
        </>
      )}
    </Section>
  );
}
