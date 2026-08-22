'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  CMS_RESOURCE_CATEGORIES,
  RESOURCE_BODY_HINT,
  type CmsResourceCategory,
} from '@/lib/resourceCategories';
import styles from './CreateResourceForm.module.css';

export function CreateResourceForm() {
  const router = useRouter();
  const [category, setCategory] = useState<CmsResourceCategory>('checklists');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

      const response = await fetch(`${apiUrl}/admin/resources`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          title: title.trim(),
          summary: summary.trim() || null,
          body: body.trim() || null,
          url: url.trim() || null,
          status,
        }),
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

      setTitle('');
      setSummary('');
      setBody('');
      setUrl('');
      setMessage('Resource item created.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Add resource item</h2>

      <label className={styles.label}>
        Section
        <select
          className={styles.input}
          value={category}
          onChange={(e) => setCategory(e.target.value as CmsResourceCategory)}
        >
          {CMS_RESOURCE_CATEGORIES.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.label}>
        Title
        <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>

      <label className={styles.label}>
        Summary (optional)
        <input className={styles.input} value={summary} onChange={(e) => setSummary(e.target.value)} />
      </label>

      <label className={styles.label}>
        Body (optional — {RESOURCE_BODY_HINT})
        <textarea className={styles.textarea} rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
      </label>

      <label className={styles.label}>
        External URL (optional — for helpful links)
        <input className={styles.input} value={url} onChange={(e) => setUrl(e.target.value)} />
      </label>

      <label className={styles.label}>
        Status
        <select
          className={styles.input}
          value={status}
          onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>

      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? 'Creating…' : 'Create item'}
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
    </form>
  );
}
