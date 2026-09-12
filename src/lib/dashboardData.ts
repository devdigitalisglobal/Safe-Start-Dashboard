import { cache } from 'react';
import { fetchDashboardApi } from '@/lib/auth';
import type {
  DashboardFilters,
  DashboardOverviewResponse,
  SchoolsResponse,
} from '@/lib/types/dashboard';

function toFilters(schoolId: string, from: string, to: string): DashboardFilters {
  return {
    schoolId: schoolId || undefined,
    from: from || undefined,
    to: to || undefined,
  };
}

/** One HTTP call for all four reporting sections (deduped per request via React cache). */
export const fetchDashboardOverview = cache(
  async (token: string, schoolId: string, from: string, to: string) =>
    fetchDashboardApi<DashboardOverviewResponse>(
      '/dashboard/overview',
      token,
      toFilters(schoolId, from, to)
    )
);

export const fetchDashboardSchools = cache(async (token: string) =>
  fetchDashboardApi<SchoolsResponse>('/dashboard/schools', token).catch(() => ({ schools: [] }))
);

export function dashboardFilterArgs(filters: DashboardFilters) {
  return [filters.schoolId ?? '', filters.from ?? '', filters.to ?? ''] as const;
}

async function loadOverview(token: string, filters: DashboardFilters) {
  const [schoolId, from, to] = dashboardFilterArgs(filters);
  return fetchDashboardOverview(token, schoolId, from, to);
}

export async function getDashboardOverview(token: string, filters: DashboardFilters) {
  return loadOverview(token, filters);
}
