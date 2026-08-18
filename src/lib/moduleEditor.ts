/** Module editor tab helpers — keep out of client components for RSC imports. */

export type ModuleEditorTab = 'details' | 'lessons' | 'quiz' | 'workflow';

export function parseModuleEditorTab(value: string | undefined): ModuleEditorTab {
  if (value === 'lessons' || value === 'quiz' || value === 'workflow') return value;
  return 'details';
}
