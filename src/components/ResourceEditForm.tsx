'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MediaPicker } from '@/components/MediaPicker';
import {
  CMS_RESOURCE_CATEGORIES,
  RESOURCE_BODY_HINT,
  type CmsResourceCategory,
} from '@/lib/resourceCategories';
import type { AdminResourceItem } from '@/lib/types/admin';
import { isInAppGuideUrl } from '@/lib/resourceUrls';
import { normalizeExternalUrl } from '@/lib/normalizeUrl';
import { RichTextField } from '@/components/RichTextField';
import { ResourceDeleteButton } from './ResourceDeleteButton';
import formStyles from './CreateResourceForm.module.css';
import editStyles from './ModuleEditForm.module.css';

type Props = {
  item: AdminResourceItem;
};

export function ResourceEditForm({ item }: Props) {
  const router = useRouter();
  const [category, setCategory] = useState<CmsResourceCategory>(
    CMS_RESOURCE_CATEGORIES.some((entry) => entry.value === item.category)
      ? (item.category as CmsResourceCategory)
      : 'checklists'
  );
  const [title, setTitle] = useState(item.title);
  const [summary, setSummary] = useState(item.summary ?? '');
  const [body, setBody] = useState(item.body ?? '');
  const [url, setUrl] = useState(
    item.category === 'resources' && item.url && isInAppGuideUrl(item.url) ? item.url : ''
  );
  const [guideLinkUrl, setGuideLinkUrl] = useState(
    item.category === 'resources' && item.url && !isInAppGuideUrl(item.url) ? item.url : ''
  );
  const [guideSource, setGuideSource] = useState<'file' | 'link'>(() => {
    if (item.category !== 'resources' || !item.url) return 'file';
    return isInAppGuideUrl(item.url) ? 'file' : 'link';
  });
  const [selectedMimeType, setSelectedMimeType] = useState('');
  const [orderIndex, setOrderIndex] = useState(String(item.orderIndex));  const [status, setStatus] = useState<'draft' | 'published'>(
    item.status === 'published' ? 'published' : 'draft'
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const parsedOrder = Number(orderIndex);
    if (!Number.isInteger(parsedOrder) || parsedOrder < 1) {
      setError('Order must be a whole number of 1 or more.');
      setLoading(false);
      return;
    }

    let resolvedUrl: string | null | undefined = url.trim() || null;
    if (category === 'resources') {
      if (guideSource === 'file') {
        if (!url.trim()) {
          setError('Choose a guide file from the media library, or switch to External link.');
          setLoading(false);
          return;
        }
        resolvedUrl = url.trim();
      } else {
        if (!guideLinkUrl.trim()) {
          setError('Enter the external URL for this guide.');
          setLoading(false);
          return;
        }
        try {
          resolvedUrl = normalizeExternalUrl(guideLinkUrl);
        } catch {
          setError('Enter a valid URL (e.g. example.com or https://…).');
          setLoading(false);
          return;
        }
      }
    }

    if (category === 'helpful_links') {
      if (!url.trim()) {
        setError('External URL is required for helpful links.');
        setLoading(false);
        return;
      }
      try {
        resolvedUrl = normalizeExternalUrl(url);
      } catch {
        setError('Enter a valid URL (e.g. example.com or https://…).');
        setLoading(false);
        return;
      }
    }

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not signed in');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('API URL is not configured');

      const response = await fetch(`${apiUrl}/admin/resources/${item.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          title: title.trim(),
          summary: summary.trim() || null,
          body: body.trim() || null,
          url:
            category === 'resources' || category === 'helpful_links'
              ? resolvedUrl
              : url.trim() || null,
          orderIndex: parsedOrder,
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

      setMessage('Resource saved.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={editStyles.wrap}>
      <form className={formStyles.form} onSubmit={handleSave}>
        <h2 className={formStyles.title}>Edit resource</h2>

        <label className={formStyles.label}>          Section
          <select
            className={formStyles.input}
            value={category}
            onChange={(e) => {
              const next = e.target.value as CmsResourceCategory;
              setCategory(next);
              if (next !== 'resources') {
                setGuideSource('file');
                setGuideLinkUrl('');
              }
            }}
          >
            {CMS_RESOURCE_CATEGORIES.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>

        <label className={formStyles.label}>
          Title
          <input
            className={formStyles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        {category === 'resources' ? (
          <>
            <fieldset className={formStyles.guideSourceFieldset}>
              <legend className={formStyles.guideSourceLegend}>Guide destination</legend>
              <label className={formStyles.guideSourceOption}>
                <input
                  type="radio"
                  name="guideSourceEdit"
                  checked={guideSource === 'file'}
                  onChange={() => setGuideSource('file')}
                />
                File from media library (JPG or PDF)
              </label>
              <label className={formStyles.guideSourceOption}>
                <input
                  type="radio"
                  name="guideSourceEdit"
                  checked={guideSource === 'link'}
                  onChange={() => setGuideSource('link')}
                />
                External link (opens in browser)
              </label>
            </fieldset>

            {guideSource === 'file' ? (
              <>
                <MediaPicker
                  label="Guide file"
                  selectedUrl={url}
                  selectedAlt={title || 'Guide file'}
                  selectedMimeType={selectedMimeType}
                  allowDocuments
                  onSelect={(selectedUrl, _alt, mimeType) => {
                    setUrl(selectedUrl);
                    setSelectedMimeType(mimeType ?? '');
                  }}
                />
                <p className={formStyles.hint}>
                  Leave summary empty so learners open the file in the app.
                </p>
              </>
            ) : (
              <label className={formStyles.label}>
                External URL
                <input
                  className={formStyles.input}
                  value={guideLinkUrl}
                  onChange={(e) => setGuideLinkUrl(e.target.value)}
                  placeholder="https://…"
                  inputMode="url"
                  autoComplete="url"
                />
              </label>
            )}
          </>
        ) : null}

        {category !== 'resources' ? (
          <div className={formStyles.label}>
            Summary (optional
            {category === 'checklists' ? ' — checklist intro shown in the app' : ' — bold, headings, links'})
            {category === 'support' ? (
              <RichTextField
                key={`support-summary-${item.id}`}
                value={summary}
                onChange={setSummary}
                minHeight={120}
                previewLabel="Summary preview"
                toolbar="inline"
              />
            ) : (
              <input
                className={formStyles.input}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            )}
          </div>
        ) : null}

        {category !== 'helpful_links' && category !== 'resources' ? (
          <div className={formStyles.label}>
            Body (optional
            {category === 'checklists' ? ` — ${RESOURCE_BODY_HINT}` : ' — bold, headings, lists'})
            {category === 'support' ? (
              <RichTextField
                key={`support-body-${item.id}`}
                value={body}
                onChange={setBody}
                minHeight={280}
                previewLabel="Article preview"
              />
            ) : (
              <textarea
                className={formStyles.textarea}
                rows={16}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            )}
          </div>
        ) : null}

        {category === 'helpful_links' ? (
          <label className={formStyles.label}>
            External URL
            <input
              className={formStyles.input}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com or example.com"
            />
          </label>
        ) : null}

        <label className={formStyles.label}>
          Order          <input
            className={formStyles.input}
            type="number"
            min={1}
            value={orderIndex}
            onChange={(e) => setOrderIndex(e.target.value)}
            required
          />
        </label>

        <label className={formStyles.label}>
          Status
          <select
            className={formStyles.input}
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>

        <button type="submit" className={formStyles.button} disabled={loading}>
          {loading ? 'Saving…' : 'Save changes'}
        </button>

        {message ? (
          <p className={formStyles.message} role="status">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className={formStyles.error} role="alert">
            {error}
          </p>
        ) : null}
      </form>

      <div className={editStyles.section}>
        <h2 className={editStyles.sectionTitle}>Delete</h2>
        <p className={editStyles.readOnlyNote}>
          Removing this item deletes it from the learner app immediately after the next refresh.
        </p>
        <ResourceDeleteButton resourceId={item.id} resourceTitle={item.title} />
      </div>
    </div>
  );
}
