import { MetricTile } from '@/components/MetricTile';
import { formatPercent } from '@/lib/filters';
import type {
  EngagementResponse,
  ImprovementResponse,
  ReachResponse,
} from '@/lib/types/dashboard';
import styles from './HeadlineTiles.module.css';

type Props = {
  improvement: ImprovementResponse | null;
  reach: ReachResponse | null;
  engagement: EngagementResponse | null;
};

export function HeadlineTiles({ improvement, reach, engagement }: Props) {
  const improvementValue =
    improvement?.suppressed || !improvement?.overall
      ? { value: null as string | null, suppressed: improvement?.suppressed }
      : {
          value: formatPercent(improvement.overall.improvement, true),
          suppressed: false,
        };

  return (
    <section className={styles.grid} aria-label="Headline metrics">
      <MetricTile
        label="Knowledge improvement"
        value={improvementValue.value}
        suppressed={improvementValue.suppressed}
        note={improvement?.suppressed ? improvement.reason : 'Starting Grid → Finish Line'}
      />
      <MetricTile
        label="Registered users"
        value={reach?.registeredUsers.count ?? null}
        suppressed={reach?.registeredUsers.suppressed}
      />
      <MetricTile
        label="Program completion"
        value={formatPercent(engagement?.summary?.programCompletionRate ?? null)}
        suppressed={engagement?.suppressed}
      />
      <MetricTile
        label="Modules completed"
        value={engagement?.summary?.modulesCompleted ?? null}
        suppressed={engagement?.suppressed}
      />
      <MetricTile
        label="Monthly active users"
        value={reach?.monthlyActiveUsers.count ?? null}
        suppressed={reach?.monthlyActiveUsers.suppressed}
      />
      <MetricTile
        label="Schools participating"
        value={reach?.schoolsParticipating.count ?? null}
      />
    </section>
  );
}
