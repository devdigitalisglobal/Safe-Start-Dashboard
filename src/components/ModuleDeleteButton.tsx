'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './ModuleEditForm.module.css';

type Props = {
  moduleId: string;
  moduleTitle: string;
  compact?: boolean;
};

export function ModuleDeleteButton({ moduleId, moduleTitle, compact = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${moduleTitle}"?\n\nThis cannot be undone. Any learner progress on this module will also be removed.`
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not signed in');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('API URL is not configured');

      const response = await fetch(`${apiUrl}/admin/modules/${moduleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        let detail = response.statusText;
        try {
          const payload = (await response.json()) as { message?: string; error?: string };
          detail = payload.error ?? payload.message ?? detail;
        } catch {
          // ignore
        }
        throw new Error(detail);
      }

      router.push('/admin/modules');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className={compact ? styles.compactDelete : undefined}>
      <button
        type="button"
        className={styles.danger}
        disabled={loading}
        onClick={handleDelete}
      >
        {loading ? 'Deleting…' : 'Delete'}
      </button>
      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
