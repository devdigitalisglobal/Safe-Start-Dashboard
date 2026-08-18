export const SUPER_ADMIN_ROLE = 'super_admin' as const;

export const DASHBOARD_ROLES = ['staff', 'super_admin', 'partner', 'school_admin'] as const;
export const CMS_ROLES = ['staff', 'super_admin', 'reviewer'] as const;
export const STAFF_ROLES = ['staff', 'super_admin'] as const;
export const SUPER_ADMIN_ROLES = [SUPER_ADMIN_ROLE] as const;

export type DashboardRole = (typeof DASHBOARD_ROLES)[number];
export type CmsRole = (typeof CMS_ROLES)[number];
export type StaffRole = (typeof STAFF_ROLES)[number];

export function isSuperAdminRole(role: string) {
  return role === SUPER_ADMIN_ROLE;
}

export function isStaffRole(role: string): role is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

export function isCmsRole(role: string): role is CmsRole {
  return (CMS_ROLES as readonly string[]).includes(role);
}

export function isDashboardRole(role: string): role is DashboardRole {
  return (DASHBOARD_ROLES as readonly string[]).includes(role);
}

export function isPortalRole(role: string): role is DashboardRole | CmsRole {
  return isDashboardRole(role) || isCmsRole(role);
}
