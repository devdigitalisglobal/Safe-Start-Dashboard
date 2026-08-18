/** Module editor tab helpers — keep out of client components for RSC imports. */

export type ModuleEditorTab = 'details' | 'lessons' | 'quiz' | 'workflow';

export function parseModuleEditorTab(value: string | undefined): ModuleEditorTab {
  if (value === 'lessons' || value === 'quiz' || value === 'workflow') return value;
  return 'details';
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
