'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LessonReorderList } from '@/components/LessonReorderList';
import { MediaPicker } from '@/components/MediaPicker';
import { ModuleQuizEditor } from '@/components/ModuleQuizEditor';
import { RichTextEditor } from '@/components/RichTextEditor';
import type { AdminModuleDetail, AdminModuleQuizQuestion } from '@/lib/types/admin';
import type { ModuleEditorTab } from '@/lib/moduleEditor';
import styles from './ModuleEditForm.module.css';

type Props = {
  module: AdminModuleDetail;
  quizQuestions: AdminModuleQuizQuestion[];
  canWrite: boolean;
  canReview: boolean;
  initialLessonId?: string;
  activeTab?: ModuleEditorTab;
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  review: 'In review',
  approved: 'Approved',
  published: 'Published',
};

export function ModuleEditForm({
  module,
  quizQuestions,
  canWrite,
  canReview,
  initialLessonId,
  activeTab = 'details',
}: Props) {
  const router = useRouter();
  const initialLesson =
    module.lessons.find((l) => l.id === initialLessonId) ?? module.lessons[0];
  const [title, setTitle] = useState(module.title);
  const [subtitle, setSubtitle] = useState(module.subtitle ?? '');
  const [heroImageUrl, setHeroImageUrl] = useState(module.heroImageUrl ?? '');
  const [heroImageAlt, setHeroImageAlt] = useState(module.heroImageAlt ?? '');
  const [status, setStatus] = useState(module.status);
  const [outcomes, setOutcomes] = useState(module.outcomes.map((o) => o.text).join('\n'));
  const [selectedLessonId, setSelectedLessonId] = useState(initialLesson?.id ?? '');
  const [lessonHeading, setLessonHeading] = useState(initialLesson?.heading ?? '');
  const [lessonBody, setLessonBody] = useState(initialLesson?.body ?? '');
  const [lessonImageUrl, setLessonImageUrl] = useState(initialLesson?.imageUrl ?? '');
  const [lessonImageAlt, setLessonImageAlt] = useState(initialLesson?.imageAlt ?? '');
  const [lessonTakeaways, setLessonTakeaways] = useState(
    initialLesson?.takeaways.map((t) => t.text).join('\n') ?? ''
  );
  const [rejectReason, setRejectReason] = useState('');
  const [isDraftingLesson, setIsDraftingLesson] = useState(false);
  const [draftHeading, setDraftHeading] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftImageUrl, setDraftImageUrl] = useState('');
  const [draftImageAlt, setDraftImageAlt] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const readOnly = !canWrite;
  const selectedLesson = module.lessons.find((l) => l.id === selectedLessonId);
  const isSummaryLesson = selectedLesson?.type === 'summary';

  function selectLesson(lessonId: string) {
    const lesson = module.lessons.find((l) => l.id === lessonId);
    setSelectedLessonId(lessonId);
    setLessonHeading(lesson?.heading ?? '');
    setLessonBody(lesson?.body ?? '');
    setLessonImageUrl(lesson?.imageUrl ?? '');
    setLessonImageAlt(lesson?.imageAlt ?? '');
    setLessonTakeaways(lesson?.takeaways.map((t) => t.text).join('\n') ?? '');
  }

  async function authedFetch(path: string, init: RequestInit = {}) {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Not signed in');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) throw new Error('API URL is not configured');

    const headers: Record<string, string> = {
      Authorization: `Bearer ${session.access_token}`,
      ...(init.headers as Record<string, string> | undefined),
    };

    if (init.body != null) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const body = (await response.json()) as { message?: string; error?: string };
        detail = body.message ?? body.error ?? detail;
      } catch {
        // ignore
      }
      throw new Error(detail);
    }

    if (response.status === 204) return undefined;

    const text = await response.text();
    if (!text) return undefined;

    return JSON.parse(text) as unknown;
  }

  async function saveModule() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await authedFetch(`/admin/modules/${module.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          subtitle: subtitle || null,
          heroImageUrl: heroImageUrl || null,
          heroImageAlt: heroImageAlt || null,
          outcomes: outcomes
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        }),
      });
      setMessage('Module saved.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  async function saveLesson() {
    if (!selectedLessonId) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload: Record<string, unknown> = {
        heading: lessonHeading,
        body: lessonBody || null,
        imageUrl: lessonImageUrl || null,
        imageAlt: lessonImageAlt || null,
      };

      if (isSummaryLesson) {
        payload.body = null;
        payload.imageUrl = null;
        payload.imageAlt = null;
        payload.takeaways = lessonTakeaways
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);
      }

      await authedFetch(`/admin/modules/${module.id}/lessons/${selectedLessonId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setMessage('Lesson saved.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  function startDraftLesson() {
    setError(null);
    setMessage(null);
    setIsDraftingLesson(true);
    setDraftHeading('');
    setDraftBody('');
    setDraftImageUrl('');
    setDraftImageAlt('');
  }

  function cancelDraftLesson() {
    setIsDraftingLesson(false);
    setDraftHeading('');
    setDraftBody('');
    setDraftImageUrl('');
    setDraftImageAlt('');
  }

  async function createLesson() {
    const heading = draftHeading.trim();
    if (!heading) {
      setError('Enter a lesson heading before creating.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const created = (await authedFetch(`/admin/modules/${module.id}/lessons`, {
        method: 'POST',
        body: JSON.stringify({
          heading,
          body: draftBody.trim() || null,
          imageUrl: draftImageUrl || null,
          imageAlt: draftImageAlt || null,
        }),
      })) as { id: string };

      setIsDraftingLesson(false);
      setMessage('Lesson created.');
      router.push(`/admin/modules/${module.id}?lesson=${created.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create lesson failed');
    } finally {
      setLoading(false);
    }
  }

  async function deleteLesson() {
    if (!selectedLessonId || !selectedLesson) return;
    if (isSummaryLesson) {
      setError('The Key Takeaways step cannot be deleted.');
      return;
    }

    const confirmed = window.confirm(`Delete "${selectedLesson.heading}"?`);
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await authedFetch(`/admin/modules/${module.id}/lessons/${selectedLessonId}`, {
        method: 'DELETE',
      });
      setMessage('Lesson deleted.');
      cancelDraftLesson();
      router.push(`/admin/modules/${module.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete lesson failed');
    } finally {
      setLoading(false);
    }
  }

  async function runWorkflow(action: 'submit-review' | 'approve' | 'reject' | 'publish') {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const path = `/admin/modules/${module.id}/${action}`;
      const init: RequestInit =
        action === 'reject'
          ? { method: 'POST', body: JSON.stringify({ reason: rejectReason || undefined }) }
          : { method: 'POST', body: '{}' };

      const result = (await authedFetch(path, init)) as { status: string };
      setStatus(result.status);

      const messages: Record<typeof action, string> = {
        'submit-review': 'Submitted for NRMA review.',
        approve: 'Module approved — staff can now publish.',
        reject: 'Module returned to draft.',
        publish: 'Module published — visible to learners.',
      };
      setMessage(messages[action]);
      if (action === 'reject') setRejectReason('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      {activeTab === 'workflow' ? (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Workflow</h2>
        <p className={styles.workflowIntro}>
          Draft → Review → Approved → Published. Status changes only through the actions below.
        </p>
        <p className={styles.statusRow}>
          Current status:{' '}
          <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
            {STATUS_LABELS[status] ?? status}
          </span>
        </p>

        <div className={styles.actions}>
          {canWrite && status === 'draft' ? (
            <button
              type="button"
              className={styles.primary}
              disabled={loading}
              onClick={() => runWorkflow('submit-review')}
            >
              Submit for review
            </button>
          ) : null}

          {canReview && status === 'review' ? (
            <>
              <button
                type="button"
                className={styles.primary}
                disabled={loading}
                onClick={() => runWorkflow('approve')}
              >
                Approve
              </button>
              <button
                type="button"
                className={styles.danger}
                disabled={loading}
                onClick={() => runWorkflow('reject')}
              >
                Reject to draft
              </button>
            </>
          ) : null}

          {canWrite && status === 'approved' ? (
            <button
              type="button"
              className={styles.secondary}
              disabled={loading}
              onClick={() => runWorkflow('publish')}
            >
              Publish to learners
            </button>
          ) : null}
        </div>

        {canReview && status === 'review' ? (
          <label className={styles.label}>
            Rejection note (optional, stored in audit log)
            <input
              className={styles.input}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="What needs to change before approval?"
            />
          </label>
        ) : null}
      </section>
      ) : null}

      {activeTab === 'details' ? (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Module details</h2>
        {readOnly ? (
          <p className={styles.readOnlyNote}>Read-only — NRMA reviewers cannot edit content.</p>
        ) : null}
        <label className={styles.label}>
          Title
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            readOnly={readOnly}
          />
        </label>
        <label className={styles.label}>
          Subtitle
          <input
            className={styles.input}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            readOnly={readOnly}
          />
        </label>
        <MediaPicker
          label="Hero image"
          selectedUrl={heroImageUrl}
          selectedAlt={heroImageAlt}
          disabled={readOnly}
          onSelect={(url, alt) => {
            setHeroImageUrl(url);
            setHeroImageAlt(alt);
          }}
        />
        <label className={styles.label}>
          Outcomes (one per line)
          <textarea
            className={styles.textarea}
            rows={5}
            value={outcomes}
            onChange={(e) => setOutcomes(e.target.value)}
            readOnly={readOnly}
          />
        </label>
        {canWrite ? (
          <button type="button" className={styles.primary} disabled={loading} onClick={saveModule}>
            Save module
          </button>
        ) : null}
      </section>
      ) : null}

      {activeTab === 'lessons' ? (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Lessons</h2>
        <p className={styles.workflowIntro}>
          Pick a step to edit. Content lessons appear before the Key Takeaways summary in the
          learner app.
        </p>

        {!isDraftingLesson ? (
          <LessonReorderList
            moduleId={module.id}
            lessons={module.lessons}
            disabled={!canWrite || loading}
          />
        ) : null}

        {canWrite ? (
          <div className={styles.lessonToolbar}>
            {!isDraftingLesson ? (
              <button
                type="button"
                className={styles.secondary}
                disabled={loading}
                onClick={startDraftLesson}
              >
                Add lesson
              </button>
            ) : (
              <button
                type="button"
                className={styles.secondary}
                disabled={loading}
                onClick={cancelDraftLesson}
              >
                Cancel new lesson
              </button>
            )}
            <button
              type="button"
              className={styles.danger}
              disabled={loading || isSummaryLesson || isDraftingLesson}
              onClick={deleteLesson}
            >
              Delete lesson
            </button>
          </div>
        ) : null}

        {isDraftingLesson ? (
          <div className={styles.draftCard}>
            <p className={styles.draftIntro}>
              New lesson — fill in the details below, then create. Nothing is saved until you
              click Create lesson.
            </p>
            <label className={styles.label}>
              Heading
              <input
                className={styles.input}
                value={draftHeading}
                onChange={(e) => setDraftHeading(e.target.value)}
                placeholder="e.g. Checking tyre pressure"
                autoFocus
              />
            </label>
            <label className={styles.label}>
              Body
              <RichTextEditor
                key="draft-lesson-body"
                value={draftBody}
                onChange={setDraftBody}
                placeholder="Lesson content shown in the learner app"
                minHeight={220}
              />
            </label>
            <MediaPicker
              label="Lesson image"
              selectedUrl={draftImageUrl}
              selectedAlt={draftImageAlt}
              onSelect={(url, alt) => {
                setDraftImageUrl(url);
                setDraftImageAlt(alt);
              }}
            />
            <button
              type="button"
              className={styles.primary}
              disabled={loading}
              onClick={createLesson}
            >
              Create lesson
            </button>
          </div>
        ) : (
          <>
        <label className={styles.label}>
          Lesson
          <select
            className={styles.input}
            value={selectedLessonId}
            onChange={(e) => selectLesson(e.target.value)}
          >
            {module.lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                Step {lesson.orderIndex}: {lesson.heading}
                {lesson.type === 'summary' ? ' (Key Takeaways)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.label}>
          Heading
          <input
            className={styles.input}
            value={lessonHeading}
            onChange={(e) => setLessonHeading(e.target.value)}
            readOnly={readOnly}
          />
        </label>
        {isSummaryLesson ? (
          <label className={styles.label}>
            Key takeaways (one per line)
            <textarea
              className={styles.textarea}
              rows={6}
              value={lessonTakeaways}
              onChange={(e) => setLessonTakeaways(e.target.value)}
              readOnly={readOnly}
            />
          </label>
        ) : (
          <>
            <label className={styles.label}>
              Body
              <RichTextEditor
                key={selectedLessonId}
                value={lessonBody}
                onChange={setLessonBody}
                readOnly={readOnly}
                minHeight={220}
              />
            </label>
            <MediaPicker
              label="Lesson image"
              selectedUrl={lessonImageUrl}
              selectedAlt={lessonImageAlt}
              disabled={readOnly}
              onSelect={(url, alt) => {
                setLessonImageUrl(url);
                setLessonImageAlt(alt);
              }}
            />
          </>
        )}
        {canWrite ? (
          <button type="button" className={styles.primary} disabled={loading} onClick={saveLesson}>
            Save lesson
          </button>
        ) : null}
          </>
        )}
      </section>
      ) : null}

      {activeTab === 'quiz' ? (
        <ModuleQuizEditor
          moduleId={module.id}
          initialQuestions={quizQuestions}
          canWrite={canWrite}
        />
      ) : null}

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
