import { cache } from 'react';
import { redirect } from 'next/navigation';
import { ApiError, apiFetch, apiGetAdmin } from '@/lib/api';
import {
  CMS_ROLES,
  DASHBOARD_ROLES,
  STAFF_ROLES,
  isCmsRole,
  isDashboardRole,
  isPortalRole,
  isStaffRole,
  isSuperAdminRole,
  SUPER_ADMIN_ROLES,
  type CmsRole,
  type DashboardRole,
  type StaffRole,
} from '@/lib/access';
import { hasMfaSatisfied, isPortalMfaRequired } from '@/lib/mfa';
import { createClient } from '@/lib/supabase/server';
import type { UserProfile } from '@/lib/types/dashboard';

export {
  CMS_ROLES,
  DASHBOARD_ROLES,
  STAFF_ROLES,
  isCmsRole,
  isDashboardRole,
  isPortalRole,
  isStaffRole,
  isSuperAdminRole,
  type CmsRole,
  type DashboardRole,
  type StaffRole,
};

/** @deprecated Use isStaffRole */
export const ADMIN_ROLES = STAFF_ROLES;

/** @deprecated Use isStaffRole */
export function isAdminRole(role: string): role is StaffRole {
  return isStaffRole(role);
}

export const getSessionToken = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
});

/** One Supabase + /users/me round trip per request (shared by layout and page). */
const requireAuthenticatedProfile = cache(async (): Promise<{
  token: string;
  profile: UserProfile;
}> => {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  let profile: UserProfile;
  try {
    profile = await apiFetch<UserProfile>('/users/me', token);
  } catch (err) {
    if (err instanceof ApiError && err.code === 'MFA_REQUIRED') {
      redirect('/account/mfa');
    }
    if (err instanceof ApiError && err.status === 403) {
      redirect('/login?error=access_denied');
    }
    redirect('/login?error=api_unreachable');
  }

  return { token, profile };
});

function enforcePortalMfa(token: string, role: string) {
  if (isPortalMfaRequired() && isPortalRole(role) && !hasMfaSatisfied(token)) {
    redirect('/account/mfa');
  }
}

export async function requireDashboardUser(): Promise<{
  token: string;
  profile: UserProfile;
}> {
  const session = await requireAuthenticatedProfile();
  enforcePortalMfa(session.token, session.profile.role);

  if (session.profile.role === 'reviewer') {
    redirect('/admin/modules');
  }

  if (!isDashboardRole(session.profile.role)) {
    redirect('/login?error=access_denied');
  }

  return session;
}

export async function requireCmsUser(): Promise<{
  token: string;
  profile: UserProfile;
}> {
  const session = await requireAuthenticatedProfile();
  enforcePortalMfa(session.token, session.profile.role);

  if (!isCmsRole(session.profile.role)) {
    redirect('/login?error=access_denied');
  }

  return session;
}

export async function requireStaffUser(): Promise<{
  token: string;
  profile: UserProfile;
}> {
  const session = await requireCmsUser();

  if (!isStaffRole(session.profile.role)) {
    redirect('/admin/modules?error=staff_only');
  }

  return session;
}

export async function requireSuperAdminUser(): Promise<{
  token: string;
  profile: UserProfile;
}> {
  const session = await requirePortalUser();

  if (!isSuperAdminRole(session.profile.role)) {
    redirect('/admin/modules?error=super_admin_only');
  }

  return session;
}

export async function requirePortalUser(): Promise<{
  token: string;
  profile: UserProfile;
}> {
  const session = await requireAuthenticatedProfile();
  enforcePortalMfa(session.token, session.profile.role);

  if (!isDashboardRole(session.profile.role) && !isCmsRole(session.profile.role)) {
    redirect('/login?error=access_denied');
  }

  return session;
}

/** Server-side admin API read — redirects to MFA when the JWT is AAL1 only. */
export async function fetchAdminApi<T>(path: string, token: string): Promise<T> {
  try {
    return await apiGetAdmin<T>(path, token);
  } catch (err) {
    if (err instanceof ApiError && err.code === 'MFA_REQUIRED') {
      redirect('/account/mfa');
    }
    throw err;
  }
}

/** Server-side dashboard API read — redirects to MFA when the JWT is AAL1 only. */
export async function fetchDashboardApi<T>(
  path: string,
  token: string,
  filters?: Parameters<typeof apiFetch>[2]
): Promise<T> {
  try {
    return await apiFetch<T>(path, token, filters);
  } catch (err) {
    if (err instanceof ApiError && err.code === 'MFA_REQUIRED') {
      redirect('/account/mfa');
    }
    throw err;
  }
}
