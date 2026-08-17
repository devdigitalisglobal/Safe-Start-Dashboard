'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AdminMediaAsset } from '@/lib/types/admin';
import styles from './MediaLibraryGrid.module.css';

type Props = {
  assets: AdminMediaAsset[];
};

export function MediaLibraryGrid({ assets }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function deleteAsset(id: string) {
    if (!window.confirm('Delete this image from the library?')) return;

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
    return <p className={styles.empty}>No images uploaded yet.</p>;
  }

  return (
    <>
      <div className={styles.grid}>
        {assets.map((asset) => (
          <article key={asset.id} className={styles.card}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.publicUrl} alt={asset.altText} className={styles.preview} />
            <div className={styles.meta}>
              <p className={styles.fileName}>{asset.fileName}</p>
              <p className={styles.alt}>{asset.altText}</p>
              <p className={styles.details}>
                {Math.round(asset.byteSize / 1024)} KB · {asset.uploadedBy}
              </p>
              <button
                type="button"
                className={styles.delete}
                disabled={busyId === asset.id}
                onClick={() => deleteAsset(asset.id)}
              >
                {busyId === asset.id ? 'Deleting…' : 'Delete'}
              </button>
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
