import { ExportActions } from '@/components/ExportActions';
import { FilterBar } from '@/components/FilterBar';
import { HeadlineTiles } from '@/components/HeadlineTiles';
import { ImprovementHero } from '@/components/ImprovementHero';
import { EngagementSection } from '@/components/EngagementSection';
import { LearningSection } from '@/components/LearningSection';
import { ReachSection } from '@/components/ReachSection';
import { requireDashboardUser } from '@/lib/auth';
import {
  fetchDashboardSchools,
  getDashboardOverview,
} from '@/lib/dashboardData';
import type { DashboardFilters } from '@/lib/types/dashboard';

type Props = {
  filters: DashboardFilters;
};

export async function DashboardFiltersRow() {
  const { token, profile } = await requireDashboardUser();
  const schoolsResponse = await fetchDashboardSchools(token);
  const canPickSchool = profile.role === 'staff' || profile.role === 'partner';

  return (
    <>
      <FilterBar
        schools={schoolsResponse.schools}
        canPickSchool={canPickSchool}
        lockedSchoolName={!canPickSchool ? profile.school?.name : null}
      />
      <ExportActions />
    </>
  );
}

export async function DashboardHeadlines({ filters }: Props) {
  const { token } = await requireDashboardUser();
  const overview = await getDashboardOverview(token, filters);

  return (
    <HeadlineTiles
      improvement={overview.improvement}
      reach={overview.reach}
      engagement={overview.engagement}
    />
  );
}

export async function DashboardImprovementSection({ filters }: Props) {
  const { token } = await requireDashboardUser();
  const overview = await getDashboardOverview(token, filters);

  return <ImprovementHero data={overview.improvement} />;
}

export async function DashboardReachSection({ filters }: Props) {
  const { token } = await requireDashboardUser();
  const overview = await getDashboardOverview(token, filters);

  return <ReachSection data={overview.reach} />;
}

export async function DashboardEngagementSection({ filters }: Props) {
  const { token } = await requireDashboardUser();
  const overview = await getDashboardOverview(token, filters);

  return <EngagementSection data={overview.engagement} />;
}

export async function DashboardLearningSection({ filters }: Props) {
  const { token } = await requireDashboardUser();
  const overview = await getDashboardOverview(token, filters);

  return <LearningSection data={overview.learning} />;
}
