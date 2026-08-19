import { Suspense } from 'react';
import {
  DashboardEngagementSection,
  DashboardFiltersRow,
  DashboardHeadlines,
  DashboardImprovementSection,
  DashboardLearningSection,
  DashboardReachSection,
} from '@/components/DashboardSections';
import {
  FilterBarSkeleton,
  HeadlineTilesSkeleton,
  SectionSkeleton,
} from '@/components/DashboardOverviewSkeleton';
import { PageHeader } from '@/components/PageHeader';
import { parseDashboardFilters } from '@/lib/filters';
import type { DashboardFilters } from '@/lib/types/dashboard';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function filtersKey(filters: DashboardFilters) {
  return [filters.schoolId ?? '', filters.from ?? '', filters.to ?? ''].join('|');
}

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseDashboardFilters(params);
  const key = filtersKey(filters);

  return (
    <>
      <PageHeader
        title="Reporting overview"
        description="Program reach, learner engagement, and knowledge improvement across your schools."
      />

      <Suspense fallback={<FilterBarSkeleton />}>
        <DashboardFiltersRow />
      </Suspense>

      <Suspense key={`headlines-${key}`} fallback={<HeadlineTilesSkeleton />}>
        <DashboardHeadlines filters={filters} />
      </Suspense>

      <Suspense key={`improvement-${key}`} fallback={<SectionSkeleton />}>
        <DashboardImprovementSection filters={filters} />
      </Suspense>

      <Suspense key={`reach-${key}`} fallback={<SectionSkeleton />}>
        <DashboardReachSection filters={filters} />
      </Suspense>

      <Suspense key={`engagement-${key}`} fallback={<SectionSkeleton />}>
        <DashboardEngagementSection filters={filters} />
      </Suspense>

      <Suspense key={`learning-${key}`} fallback={<SectionSkeleton />}>
        <DashboardLearningSection filters={filters} />
      </Suspense>
    </>
  );
}
