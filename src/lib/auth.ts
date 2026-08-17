import { redirect } from 'next/navigation';
import { ApiError, apiFetch } from '@/lib/api';
import {
  CMS_ROLES,
  DASHBOARD_ROLES,
  STAFF_ROLES,
  isCmsRole,
  isDashboardRole,
  isPortalRole,
  isStaffRole,
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

export async function getSessionToken() {
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
}

async function requireAuthenticatedProfile(): Promise<{
  token: string;
  profile: UserProfile;
}> {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  let profile: UserProfile;
  try {
    profile = await apiFetch<UserProfile>('/users/me', token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      redirect('/login?error=access_denied');
    }
    redirect('/login?error=api_unreachable');
  }

  return { token, profile };
}

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
