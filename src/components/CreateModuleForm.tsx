'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RichTextField } from '@/components/RichTextField';
import styles from './CreateSchoolForm.module.css';

export function CreateModuleForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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

      const body: Record<string, string> = { title: title.trim() };
      if (subtitle.trim()) body.subtitle = subtitle.trim();

      const response = await fetch(`${apiUrl}/admin/modules`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let detail = response.statusText;
        try {
          const payload = (await response.json()) as { message?: string };
          detail = payload.message ?? detail;
        } catch {
          // ignore
        }
        throw new Error(detail);
      }

      const created = (await response.json()) as { id: string };
      router.push(`/admin/modules/${created.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create module');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <h2 className={styles.title}>Add module</h2>
      <div className={styles.grid}>
        <label className={styles.label}>
          Title
          <input
            className={styles.input}
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Buying Your First Car Safely"
          />
        </label>
        <label className={styles.label}>
          Subtitle (optional)
          <RichTextField
            value={subtitle}
            onChange={setSubtitle}
            placeholder="Short learner-facing description"
            minHeight={100}
            previewLabel="Subtitle preview"
          />
        </label>
      </div>
      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? 'Creating…' : 'Create module'}
      </button>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
