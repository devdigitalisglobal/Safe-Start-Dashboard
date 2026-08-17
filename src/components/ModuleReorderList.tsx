'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AdminModuleSummary } from '@/lib/types/admin';
import styles from './ModuleReorderList.module.css';

type Props = {
  modules: AdminModuleSummary[];
};

export function ModuleReorderList({ modules: initial }: Props) {
  const router = useRouter();
  const [modules, setModules] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= modules.length) return;

    const next = [...modules];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setModules(next.map((m, i) => ({ ...m, orderIndex: i + 1 })));
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

      const response = await fetch(`${apiUrl}/admin/modules/reorder`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modules: modules.map((m) => ({ id: m.id, orderIndex: m.orderIndex })),
        }),
      });

      if (!response.ok) throw new Error('Failed to save order');

      setMessage('Module order saved.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <ul className={styles.list}>
        {modules.map((module, index) => (
          <li key={module.id} className={styles.item}>
            <span className={styles.order}>{module.orderIndex}</span>
            <span className={styles.title}>{module.title}</span>
            <span className={styles.status}>{module.status}</span>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.iconBtn}
                disabled={index === 0 || loading}
                onClick={() => move(index, -1)}
                aria-label={`Move ${module.title} up`}
              >
                ↑
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                disabled={index === modules.length - 1 || loading}
                onClick={() => move(index, 1)}
                aria-label={`Move ${module.title} down`}
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button type="button" className={styles.save} disabled={loading} onClick={saveOrder}>
        {loading ? 'Saving order…' : 'Save module order'}
      </button>

      {message ? <p className={styles.message}>{message}</p> : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
