'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from './ModuleEditorTabs.module.css';

export type ModuleEditorTab = 'details' | 'lessons' | 'quiz' | 'workflow';

const TABS: { id: ModuleEditorTab; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'workflow', label: 'Workflow' },
];

type Props = {
  moduleId: string;
  activeTab: ModuleEditorTab;
};

export function ModuleEditorTabs({ moduleId, activeTab }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lesson = searchParams.get('lesson');

  function hrefFor(tab: ModuleEditorTab) {
    const params = new URLSearchParams();
    params.set('tab', tab);
    if (tab === 'lessons' && lesson) {
      params.set('lesson', lesson);
    }
    return `${pathname}?${params.toString()}`;
  }

  return (
    <nav className={styles.nav} aria-label="Module editor sections">
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={hrefFor(tab.id)}
            className={active ? styles.tabActive : styles.tab}
            aria-current={active ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function parseModuleEditorTab(value: string | undefined): ModuleEditorTab {
  if (value === 'lessons' || value === 'quiz' || value === 'workflow') return value;
  return 'details';
}
