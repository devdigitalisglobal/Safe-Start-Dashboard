'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MediaPicker } from '@/components/MediaPicker';
import type { AdminBranding } from '@/lib/types/admin';
import styles from './BrandingForm.module.css';

type Props = {
  branding: AdminBranding;
};

export function BrandingForm({ branding }: Props) {
  const router = useRouter();
  const [partnerName, setPartnerName] = useState(branding.partnerName ?? '');
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl ?? '');
  const [logoAlt, setLogoAlt] = useState(branding.logoAlt ?? '');
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

      const response = await fetch(`${apiUrl}/admin/branding`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerName: partnerName.trim() || null,
          logoUrl: logoUrl || null,
          logoAlt: logoUrl ? logoAlt.trim() || null : null,
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

      setMessage('Partner branding saved. The learner app will pick this up within a few minutes.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  function clearLogo() {
    setLogoUrl('');
    setLogoAlt('');
  }

  return (
    <div className={styles.wrap}>
      <label className={styles.label}>
        Partner name
        <input
          className={styles.input}
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
          placeholder="e.g. NRMA"
        />
      </label>

      <MediaPicker
        label="Partner logo"
        selectedUrl={logoUrl}
        selectedAlt={logoAlt}
        onSelect={(url, alt) => {
          setLogoUrl(url);
          setLogoAlt(alt);
        }}
      />

      {logoUrl ? (
        <button type="button" className={styles.clear} onClick={clearLogo}>
          Remove partner logo
        </button>
      ) : null}

      <button type="button" className={styles.button} disabled={loading} onClick={save}>
        {loading ? 'Saving…' : 'Save branding'}
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
