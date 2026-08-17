const ROLE_LABELS: Record<string, string> = {
  staff: 'Staff',
  partner: 'Partner',
  school_admin: 'School admin',
  reviewer: 'Content reviewer',
};

export function roleLabel(role: string) {
  return ROLE_LABELS[role] ?? role.replace(/_/g, ' ');
}
