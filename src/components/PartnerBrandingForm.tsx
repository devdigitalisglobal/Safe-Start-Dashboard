'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MediaPicker } from '@/components/MediaPicker';
import type { AdminPartnerDetail } from '@/lib/types/admin';
import styles from './BrandingForm.module.css';

type Props = {
  partner: AdminPartnerDetail;
};

export function PartnerBrandingForm({ partner }: Props) {
  const router = useRouter();
  const [name, setName] = useState(partner.name);
  const [logoUrl, setLogoUrl] = useState(partner.logoUrl ?? '');
  const [logoAlt, setLogoAlt] = useState(partner.logoAlt ?? '');
  const [isDefault, setIsDefault] = useState(partner.isDefault);
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

      const response = await fetch(`${apiUrl}/admin/partners/${partner.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          logoUrl: logoUrl || null,
          logoAlt: logoUrl ? logoAlt.trim() || null : null,
          isDefault,
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

      setMessage('Partner branding saved.');
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
          value={name}
          onChange={(e) => setName(e.target.value)}
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

      <label className={styles.checkbox}>
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
        Use as default partner (shown before login and for schools without a partner)
      </label>

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
