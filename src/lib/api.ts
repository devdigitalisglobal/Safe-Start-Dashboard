import type { DashboardFilters } from '@/lib/types/dashboard';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function buildUrl(path: string, filters?: DashboardFilters) {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  const url = new URL(path, API_URL);
  if (filters?.schoolId) url.searchParams.set('schoolId', filters.schoolId);
  if (filters?.from) url.searchParams.set('from', filters.from);
  if (filters?.to) url.searchParams.set('to', filters.to);
  return url.toString();
}

export async function apiFetch<T>(
  path: string,
  token: string,
  filters?: DashboardFilters
): Promise<T> {
  const res = await fetch(buildUrl(path, filters), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = res.statusText;
    let code: string | undefined;
    try {
      const body = (await res.json()) as { message?: string; code?: string };
      message = body.message ?? message;
      code = body.code;
    } catch {
      // non-JSON error body
    }
    throw new ApiError(res.status, message, code);
  }

  return res.json() as Promise<T>;
}

export async function apiGetDashboard<T>(
  section: 'reach' | 'engagement' | 'learning' | 'improvement',
  token: string,
  filters?: DashboardFilters
) {
  return apiFetch<T>(`/dashboard/${section}`, token, filters);
}

export async function apiGetAdmin<T>(path: string, token: string) {
  return apiFetch<T>(`/admin/${path}`, token);
}

export async function apiPatchAdmin<T>(
  path: string,
  token: string,
  body: Record<string, unknown>
) {
  const url = buildUrl(`/admin/${path}`);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const payload = (await res.json()) as { message?: string };
      message = payload.message ?? message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export async function apiPostAdmin<T>(
  path: string,
  token: string,
  body: Record<string, unknown> = {}
) {
  const url = buildUrl(`/admin/${path}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const payload = (await res.json()) as { message?: string };
      message = payload.message ?? message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export async function apiDeleteAdmin<T>(path: string, token: string) {
  const url = buildUrl(`/admin/${path}`);
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const payload = (await res.json()) as { message?: string };
      message = payload.message ?? message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}
