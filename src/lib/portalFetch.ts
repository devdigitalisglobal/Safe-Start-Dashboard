'use client';

import { createClient } from '@/lib/supabase/client';
import { ApiError } from '@/lib/api';

function apiBase() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('API URL is not configured');
  return apiUrl;
}

async function throwPortalApiError(res: Response): Promise<never> {
  let message = res.statusText;
  let code: string | undefined;

  try {
    const body = (await res.json()) as { message?: string; code?: string; error?: string };
    message = body.message ?? body.error ?? message;
    code = body.code;
  } catch {
    // non-JSON error body
  }

  if (code === 'MFA_REQUIRED') {
    window.location.assign('/account/mfa');
  }

  throw new ApiError(res.status, message, code);
}

/** Authenticated portal API call from client components — redirects on MFA_REQUIRED. */
export async function portalFetch(path: string, init: RequestInit = {}): Promise<unknown> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not signed in');

  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.access_token}`,
    ...(init.headers as Record<string, string> | undefined),
  };

  if (init.body != null && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${apiBase()}${path}`, { ...init, headers });
  if (!res.ok) await throwPortalApiError(res);

  if (res.status === 204) return undefined;

  const text = await res.text();
  if (!text) return undefined;

  return JSON.parse(text) as unknown;
}

export async function portalPost<T>(path: string, body?: unknown): Promise<T> {
  return portalFetch(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }) as Promise<T>;
}

export async function portalPatch<T>(path: string, body: unknown): Promise<T> {
  return portalFetch(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }) as Promise<T>;
}

export async function portalPut<T>(path: string, body: unknown): Promise<T> {
  return portalFetch(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  }) as Promise<T>;
}

export async function portalDelete<T>(path: string): Promise<T> {
  return portalFetch(path, { method: 'DELETE' }) as Promise<T>;
}
