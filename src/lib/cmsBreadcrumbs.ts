import type { ModuleEditorTab } from '@/lib/moduleEditor';

export type CmsCrumb = {
  label: string;
  href?: string;
};

export function formatAssessmentType(type: string) {
  return type === 'starting_grid' ? 'Starting Grid' : 'Finish Line';
}

export function moduleEditorTabLabel(tab: ModuleEditorTab) {
  const labels: Record<ModuleEditorTab, string> = {
    details: 'Details',
    lessons: 'Lessons',
    quiz: 'Quiz',
    workflow: 'Workflow',
  };
  return labels[tab];
}

export function contentModulesCrumbs(): CmsCrumb[] {
  return [
    { label: 'Content', href: '/admin/modules' },
    { label: 'Modules', href: '/admin/modules' },
  ];
}

export function organisationTeamCrumbs(): CmsCrumb[] {
  return [
    { label: 'Organisation', href: '/admin/schools' },
    { label: 'Team', href: '/admin/users' },
  ];
}

export function organisationSchoolsCrumbs(): CmsCrumb[] {
  return [
    { label: 'Organisation', href: '/admin/schools' },
    { label: 'Schools', href: '/admin/schools' },
  ];
}

export function organisationPartnersCrumbs(): CmsCrumb[] {
  return [
    { label: 'Organisation', href: '/admin/schools' },
    { label: 'Partners', href: '/admin/partners' },
  ];
}

export function contentAssessmentsCrumbs(): CmsCrumb[] {
  return [
    { label: 'Content', href: '/admin/modules' },
    { label: 'Assessments', href: '/admin/assessments' },
  ];
}
