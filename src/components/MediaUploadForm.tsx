'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './MediaUploadForm.module.css';

export function MediaUploadForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [altText, setAltText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError('Choose a file to upload.');
      return;
    }
    if (!altText.trim()) {
      setError('Alt text is required for accessibility.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not signed in');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('API URL is not configured');

      const formData = new FormData();
      // altText must come before file — @fastify/multipart only attaches prior fields to data.fields
      formData.append('altText', altText.trim());
      formData.append('file', file);

      const response = await fetch(`${apiUrl}/admin/media`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
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

      setAltText('');
      if (fileRef.current) fileRef.current.value = '';
      setMessage('File uploaded to the media library.');      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Upload file</h2>
      <p className={styles.help}>
        Images (JPEG, PNG, WebP, GIF) or PDF up to 5 MB. For module covers use WebP at roughly
        1200 px wide. Alt text is required — describe what the file shows for screen reader users.
      </p>

      <label className={styles.label}>
        File
        <input
          ref={fileRef}
          className={styles.file}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
          required
        />      </label>

      <label className={styles.label}>
        Alt text (required)
        <input
          className={styles.input}
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="e.g. Red hatchback parked on a suburban street"
          maxLength={500}
          required
        />
      </label>

      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? 'Uploading…' : 'Upload to library'}
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
