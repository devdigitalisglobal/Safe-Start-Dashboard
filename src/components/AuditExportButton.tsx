'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './AuditExportButton.module.css';

type Props = {
  from?: string;
  to?: string;
  type?: string;
};

export function AuditExportButton({ from, to, type }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
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

      const params = new URLSearchParams({ limit: '1000' });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (type) params.set('type', type);

      const response = await fetch(`${apiUrl}/admin/audit/export/csv?${params}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        throw new Error(`Export failed (${response.status})`);
      }

      const blob = await response.blob();
      const stamp = new Date().toISOString().slice(0, 10);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `safe-start-audit-${stamp}.csv`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        disabled={loading}
        onClick={download}
        aria-label="Export audit log as CSV"
      >
        {loading ? 'Exporting…' : 'Export CSV'}
      </button>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
