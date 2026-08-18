'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ModuleEditorTab } from '@/lib/moduleEditor';
import styles from './ModuleEditorTabs.module.css';

const TABS: { id: ModuleEditorTab; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'workflow', label: 'Workflow' },
];

type Props = {
  activeTab: ModuleEditorTab;
  lessonId?: string;
};

export function ModuleEditorTabs({ activeTab, lessonId }: Props) {
  const pathname = usePathname();

  function hrefFor(tab: ModuleEditorTab) {
    const params = new URLSearchParams();
    params.set('tab', tab);
    if (tab === 'lessons' && lessonId) {
      params.set('lesson', lessonId);
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
