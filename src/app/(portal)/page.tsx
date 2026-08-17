import { Suspense } from 'react';
import { EngagementSection } from '@/components/EngagementSection';
import { ExportActions } from '@/components/ExportActions';
import { FilterBar } from '@/components/FilterBar';
import { HeadlineTiles } from '@/components/HeadlineTiles';
import { ImprovementHero } from '@/components/ImprovementHero';
import { LearningSection } from '@/components/LearningSection';
import { PageHeader } from '@/components/PageHeader';
import { ReachSection } from '@/components/ReachSection';
import { apiFetch, apiGetDashboard } from '@/lib/api';
import { requireDashboardUser } from '@/lib/auth';
import { parseDashboardFilters } from '@/lib/filters';
import type {
  EngagementResponse,
  ImprovementResponse,
  LearningResponse,
  ReachResponse,
  SchoolsResponse,
} from '@/lib/types/dashboard';
import styles from './page.module.css';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseDashboardFilters(params);
  const { token, profile } = await requireDashboardUser();

  const canPickSchool = profile.role === 'staff' || profile.role === 'partner';

  const [improvement, reach, engagement, learning, schoolsResponse] = await Promise.all([
    apiGetDashboard<ImprovementResponse>('improvement', token, filters).catch(() => null),
    apiGetDashboard<ReachResponse>('reach', token, filters).catch(() => null),
    apiGetDashboard<EngagementResponse>('engagement', token, filters).catch(() => null),
    apiGetDashboard<LearningResponse>('learning', token, filters).catch(() => null),
    apiFetch<SchoolsResponse>('/dashboard/schools', token).catch(() => ({ schools: [] })),
  ]);

  return (
    <>
      <PageHeader
        title="Reporting overview"
        description="Program reach, learner engagement, and knowledge improvement across your schools."
      />

      <Suspense fallback={<div className={styles.filterFallback}>Loading filters…</div>}>
        <FilterBar
          schools={schoolsResponse.schools}
          canPickSchool={canPickSchool}
          lockedSchoolName={!canPickSchool ? profile.school?.name : null}
        />
        <ExportActions />
      </Suspense>

      <HeadlineTiles improvement={improvement} reach={reach} engagement={engagement} />

      <ImprovementHero data={improvement} />

      <ReachSection data={reach} />

      <EngagementSection data={engagement} />

      <LearningSection data={learning} />
    </>
  );
}
