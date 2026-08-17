'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AdminModuleDetail } from '@/lib/types/admin';
import styles from './LessonReorderList.module.css';

type Lesson = AdminModuleDetail['lessons'][number];

type Props = {
  moduleId: string;
  lessons: Lesson[];
  disabled?: boolean;
};

function buildOrderedLessons(contentLessons: Lesson[], summaryLesson: Lesson | undefined) {
  const orderedContent = contentLessons.map((lesson, index) => ({
    ...lesson,
    orderIndex: index + 1,
  }));

  if (!summaryLesson) return orderedContent;

  return [
    ...orderedContent,
    { ...summaryLesson, orderIndex: orderedContent.length + 1 },
  ];
}

export function LessonReorderList({ moduleId, lessons, disabled = false }: Props) {
  const router = useRouter();
  const summaryLesson = useMemo(
    () => lessons.find((lesson) => lesson.type === 'summary'),
    [lessons]
  );
  const initialContent = useMemo(
    () =>
      lessons
        .filter((lesson) => lesson.type !== 'summary')
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [lessons]
  );

  const [contentLessons, setContentLessons] = useState(initialContent);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setContentLessons(initialContent);
  }, [initialContent]);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= contentLessons.length) return;

    const next = [...contentLessons];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setContentLessons(next);
  }

  async function saveOrder() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not signed in');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('API URL is not configured');

      const payload = buildOrderedLessons(contentLessons, summaryLesson).map((lesson) => ({
        id: lesson.id,
        orderIndex: lesson.orderIndex,
      }));

      const response = await fetch(`${apiUrl}/admin/modules/${moduleId}/lessons/reorder`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessons: payload }),
      });

      if (!response.ok) {
        let detail = response.statusText;
        try {
          const body = (await response.json()) as { message?: string; error?: string };
          detail = body.message ?? body.error ?? detail;
        } catch {
          // ignore
        }
        throw new Error(detail);
      }

      setMessage('Lesson order saved.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  if (contentLessons.length === 0 && !summaryLesson) return null;

  return (
    <div className={styles.wrap}>
      <ul className={styles.list}>
        {contentLessons.map((lesson, index) => (
          <li key={lesson.id} className={styles.item}>
            <span className={styles.order}>{index + 1}</span>
            <span className={styles.title}>{lesson.heading}</span>
            <span className={styles.status}>Lesson</span>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.iconBtn}
                disabled={disabled || loading || index === 0}
                onClick={() => move(index, -1)}
                aria-label={`Move ${lesson.heading} up`}
              >
                ↑
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                disabled={disabled || loading || index === contentLessons.length - 1}
                onClick={() => move(index, 1)}
                aria-label={`Move ${lesson.heading} down`}
              >
                ↓
              </button>
            </div>
          </li>
        ))}

        {summaryLesson ? (
          <li key={summaryLesson.id} className={styles.item}>
            <span className={styles.order}>{contentLessons.length + 1}</span>
            <span className={styles.title}>{summaryLesson.heading}</span>
            <span className={styles.status}>Key Takeaways</span>
            <div className={styles.actions} aria-hidden="true">
              <button type="button" className={styles.iconBtn} disabled>
                ↑
              </button>
              <button type="button" className={styles.iconBtn} disabled>
                ↓
              </button>
            </div>
          </li>
        ) : null}
      </ul>

      {contentLessons.length > 1 ? (
        <button
          type="button"
          className={styles.save}
          disabled={disabled || loading}
          onClick={saveOrder}
        >
          {loading ? 'Saving order…' : 'Save lesson order'}
        </button>
      ) : null}

      {message ? <p className={styles.message}>{message}</p> : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
