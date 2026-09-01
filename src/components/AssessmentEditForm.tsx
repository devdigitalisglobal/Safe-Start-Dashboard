'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MediaPicker } from '@/components/MediaPicker';
import { RichTextField } from '@/components/RichTextField';
import type { AdminAssessmentDetailResponse } from '@/lib/types/admin';
import styles from './ModuleEditForm.module.css';
import navStyles from '@/app/admin/modules/page.module.css';

type Assessment = AdminAssessmentDetailResponse['assessment'];

type Props = {
  assessment: Assessment;
};

export function AssessmentEditForm({ assessment }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(assessment.title);
  const [subtitle, setSubtitle] = useState(assessment.subtitle ?? '');
  const [description, setDescription] = useState(assessment.description ?? '');
  const [heroImageUrl, setHeroImageUrl] = useState(assessment.heroImageUrl ?? '');
  const [heroImageAlt, setHeroImageAlt] = useState(assessment.heroImageAlt ?? '');
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

      const response = await fetch(`${apiUrl}/admin/assessments/${assessment.type}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          description: description.trim() || null,
          heroImageUrl: heroImageUrl || null,
          heroImageAlt: heroImageAlt || null,
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

      setMessage('Saved.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={navStyles.introActions}>
        <Link className={navStyles.secondaryButton} href={`/admin/assessments/${assessment.type}`}>
          Questions ({assessment.questionCount})
        </Link>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Intro screen</h2>
        <p className={styles.workflowIntro}>
          Copy and hero image shown on the assessment intro before learners begin the questions.
          Leave the hero image empty to show the default flag icon in the app.
        </p>

        <label className={styles.label}>
          Title
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <div className={styles.label}>
          Subtitle
          <RichTextField
            key={`assessment-subtitle-${assessment.id}`}
            value={subtitle}
            onChange={setSubtitle}
            placeholder="Short line under the title on the intro screen"
            minHeight={100}
            previewLabel="Subtitle preview"
            toolbar="inline"
          />
        </div>

        <div className={styles.label}>
          Description
          <RichTextField
            key={`assessment-description-${assessment.id}`}
            value={description}
            onChange={setDescription}
            placeholder="Optional paragraph below the hero image"
            minHeight={120}
            previewLabel="Description preview"
            toolbar="inline"
          />
        </div>

        <MediaPicker
          label="Hero image"
          selectedUrl={heroImageUrl}
          selectedAlt={heroImageAlt}
          onSelect={(url, alt) => {
            setHeroImageUrl(url);
            setHeroImageAlt(alt);
          }}
        />

        <button type="button" className={styles.primary} disabled={loading} onClick={save}>
          {loading ? 'Saving…' : 'Save intro'}
        </button>

        {message ? <p className={styles.success}>{message}</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}
