'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AdminMediaAsset } from '@/lib/types/admin';
import styles from './MediaLibraryGrid.module.css';

type Props = {
  assets: AdminMediaAsset[];
};

function isPdfAsset(asset: AdminMediaAsset) {
  return asset.mimeType === 'application/pdf';
}

export function MediaLibraryGrid({ assets }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function copyUrl(asset: AdminMediaAsset) {
    try {
      await navigator.clipboard.writeText(asset.publicUrl);
      setCopiedId(asset.id);
      window.setTimeout(() => setCopiedId((current) => (current === asset.id ? null : current)), 2000);
    } catch {
      setError('Could not copy URL — try again or use Choose from library when editing a guide.');
    }
  }

  async function deleteAsset(id: string) {
    if (!window.confirm('Delete this file from the library?')) return;

    setBusyId(id);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not signed in');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('API URL is not configured');

      const response = await fetch(`${apiUrl}/admin/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) throw new Error('Delete failed');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setBusyId(null);
    }
  }

  if (assets.length === 0) {
    return <p className={styles.empty}>No files uploaded yet.</p>;
  }

  return (
    <>
      <div className={styles.grid}>
        {assets.map((asset) => (
          <article key={asset.id} className={styles.card}>
            {isPdfAsset(asset) ? (
              <div className={styles.pdfPreview} aria-hidden>
                PDF
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={asset.publicUrl} alt={asset.altText} className={styles.preview} />
            )}
            <div className={styles.meta}>
              <p className={styles.fileName}>{asset.fileName}</p>
              <p className={styles.alt}>{asset.altText}</p>
              <p className={styles.details}>
                {Math.round(asset.byteSize / 1024)} KB · {asset.uploadedBy}
              </p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.copy}
                  onClick={() => copyUrl(asset)}
                >
                  {copiedId === asset.id ? 'Copied' : 'Copy URL'}
                </button>
                <a
                  className={styles.open}
                  href={asset.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open
                </a>
                <button
                  type="button"
                  className={styles.delete}
                  disabled={busyId === asset.id}
                  onClick={() => deleteAsset(asset.id)}
                >
                  {busyId === asset.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
