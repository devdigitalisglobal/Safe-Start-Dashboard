'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AdminMediaAsset } from '@/lib/types/admin';
import styles from './MediaPicker.module.css';

type Props = {
  label: string;
  selectedUrl: string;
  selectedAlt: string;
  selectedMimeType?: string;
  onSelect: (url: string, alt: string, mimeType?: string) => void;
  disabled?: boolean;
  /** When true, PDFs from the library can be selected (for Guides). */
  allowDocuments?: boolean;
};

function isPdf(mimeType: string) {
  return mimeType === 'application/pdf';
}

export function MediaPicker({
  label,
  selectedUrl,
  selectedAlt,
  selectedMimeType,
  onSelect,
  disabled,
  allowDocuments = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<AdminMediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

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
  }, [open]);

  const visibleAssets = allowDocuments
    ? assets
    : assets.filter((asset) => !isPdf(asset.mimeType));

  const selectedIsPdf = selectedMimeType ? isPdf(selectedMimeType) : selectedUrl.toLowerCase().endsWith('.pdf');

  return (
    <div className={styles.wrap}>
      <p className={styles.label}>{label}</p>

      {selectedUrl ? (
        <div className={styles.selected}>
          {selectedIsPdf ? (
            <div className={styles.pdfThumb} aria-hidden>
              PDF
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={selectedUrl} alt={selectedAlt || 'Selected file'} className={styles.thumb} />
          )}
          <div>
            <p className={styles.altPreview}>{selectedAlt || 'No alt text set'}</p>
            {!disabled ? (
              <button type="button" className={styles.linkButton} onClick={() => setOpen(true)}>
                Change file
              </button>
            ) : null}
          </div>
        </div>
      ) : !disabled ? (
        <button type="button" className={styles.pickButton} onClick={() => setOpen(true)}>
          Choose from media library
        </button>
      ) : (
        <p className={styles.empty}>No file selected</p>
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

            {loading ? <p className={styles.status}>Loading files…</p> : null}
            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}

            {!loading && visibleAssets.length === 0 ? (
              <p className={styles.status}>
                No files yet. Upload on the Media library page first.
              </p>
            ) : null}

            <div className={styles.grid}>
              {visibleAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className={styles.assetButton}
                  onClick={() => {
                    onSelect(asset.publicUrl, asset.altText, asset.mimeType);
                    setOpen(false);
                  }}
                >
                  {isPdf(asset.mimeType) ? (
                    <div className={styles.pdfTile} aria-hidden>
                      PDF
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={asset.publicUrl} alt={asset.altText} className={styles.assetImage} />
                  )}
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
