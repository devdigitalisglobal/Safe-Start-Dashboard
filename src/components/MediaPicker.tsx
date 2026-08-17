'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AdminMediaAsset } from '@/lib/types/admin';
import styles from './MediaPicker.module.css';

type Props = {
  label: string;
  selectedUrl: string;
  selectedAlt: string;
  onSelect: (url: string, alt: string) => void;
  disabled?: boolean;
};

export function MediaPicker({ label, selectedUrl, selectedAlt, onSelect, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<AdminMediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || assets.length > 0) return;

    async function load() {
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

        const response = await fetch(`${apiUrl}/admin/media?limit=100`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!response.ok) throw new Error('Could not load media library');

        const data = (await response.json()) as { assets: AdminMediaAsset[] };
        setAssets(data.assets);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Load failed');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [open, assets.length]);

  return (
    <div className={styles.wrap}>
      <p className={styles.label}>{label}</p>

      {selectedUrl ? (
        <div className={styles.selected}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selectedUrl} alt={selectedAlt || 'Selected image'} className={styles.thumb} />
          <div>
            <p className={styles.altPreview}>{selectedAlt || 'No alt text set'}</p>
            {!disabled ? (
              <button type="button" className={styles.linkButton} onClick={() => setOpen(true)}>
                Change image
              </button>
            ) : null}
          </div>
        </div>
      ) : !disabled ? (
        <button type="button" className={styles.pickButton} onClick={() => setOpen(true)}>
          Choose from media library
        </button>
      ) : (
        <p className={styles.empty}>No image selected</p>
      )}

      {open ? (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => setOpen(false)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-label="Media library"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Media library</h3>
              <button type="button" className={styles.close} onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            {loading ? <p className={styles.status}>Loading images…</p> : null}
            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}

            {!loading && assets.length === 0 ? (
              <p className={styles.status}>
                No images yet. Upload some on the Media library page first.
              </p>
            ) : null}

            <div className={styles.grid}>
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className={styles.assetButton}
                  onClick={() => {
                    onSelect(asset.publicUrl, asset.altText);
                    setOpen(false);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.publicUrl} alt={asset.altText} className={styles.assetImage} />
                  <span className={styles.assetAlt}>{asset.altText}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
