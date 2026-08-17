'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './ExportActions.module.css';

export function ExportActions() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<'csv' | 'pdf' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function download(format: 'csv' | 'pdf') {
    setLoading(format);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not signed in');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('API URL is not configured');

      const query = searchParams.toString();
      const url = `${apiUrl}/dashboard/export/${format}${query ? `?${query}` : ''}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        throw new Error(`Export failed (${response.status})`);
      }

      const blob = await response.blob();
      const stamp = new Date().toISOString().slice(0, 10);
      const ext = format === 'csv' ? 'csv' : 'pdf';
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `safe-start-dashboard-${stamp}.${ext}`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.button}
          disabled={loading !== null}
          onClick={() => download('csv')}
        >
          {loading === 'csv' ? 'Exporting CSV…' : 'Export CSV'}
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={loading !== null}
          onClick={() => download('pdf')}
        >
          {loading === 'pdf' ? 'Exporting PDF…' : 'Export PDF'}
        </button>
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
