'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AdminPartnerSummary } from '@/lib/types/admin';
import styles from './BrandingForm.module.css';

type Props = {
  schoolId: string;
  partnerId: string | null;
  partners: AdminPartnerSummary[];
};

export function SchoolPartnerForm({ schoolId, partnerId, partners }: Props) {
  const router = useRouter();
  const [selectedPartnerId, setSelectedPartnerId] = useState(partnerId ?? '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
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

      const response = await fetch(`${apiUrl}/admin/schools/${schoolId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId: selectedPartnerId || null,
        }),
      });

      if (!response.ok) {
        let detail = response.statusText;
        try {
          const body = (await response.json()) as { message?: string };
          detail = body.message ?? detail;
        } catch {
          // ignore
        }
        throw new Error(detail);
      }

      setMessage('School partner updated.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <label className={styles.label}>
        Co-branding partner
        <select
          className={styles.input}
          value={selectedPartnerId}
          onChange={(e) => setSelectedPartnerId(e.target.value)}
        >
          <option value="">Default partner</option>
          {partners.map((partner) => (
            <option key={partner.id} value={partner.id}>
              {partner.name}
            </option>
          ))}
        </select>
      </label>

      <button type="button" className={styles.button} disabled={loading} onClick={save}>
        {loading ? 'Saving…' : 'Save partner'}
      </button>

      {message ? (
        <p className={styles.message} role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
