import { MetricTile } from '@/components/MetricTile';
import { Section } from '@/components/Section';
import { formatPercent } from '@/lib/filters';
import type { ReachResponse } from '@/lib/types/dashboard';
import styles from './ReachSection.module.css';

type Props = {
  data: ReachResponse | null;
};

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
        </>
      )}
    </Section>
  );
}
