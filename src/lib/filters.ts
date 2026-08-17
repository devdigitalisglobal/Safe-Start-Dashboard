import type { DashboardFilters } from '@/lib/types/dashboard';

export function parseDashboardFilters(
  params: Record<string, string | string[] | undefined>
): DashboardFilters {
  const pick = (key: string) => {
    const value = params[key];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  };

  return {
    schoolId: pick('schoolId'),
    from: pick('from'),
    to: pick('to'),
  };
}

export function formatDuration(seconds: number | null | undefined) {
  if (seconds == null) return null;
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

export function formatPercent(value: number | null | undefined, signed = false) {
  if (value == null) return null;
  const prefix = signed && value > 0 ? '+' : '';
  return `${prefix}${value}%`;
}
