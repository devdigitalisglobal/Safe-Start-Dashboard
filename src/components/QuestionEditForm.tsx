'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AdminKnowledgeAreasResponse, AdminQuestionsResponse } from '@/lib/types/admin';
import { RichTextField } from '@/components/RichTextField';
import styles from './QuestionEditForm.module.css';

type Question = AdminQuestionsResponse['questions'][number];

type Props = {
  question: Question;
  knowledgeAreas: AdminKnowledgeAreasResponse['knowledgeAreas'];
};

export function QuestionEditForm({ question, knowledgeAreas }: Props) {
  const router = useRouter();
  const [text, setText] = useState(question.text);
  const [explanation, setExplanation] = useState(question.explanation ?? '');
  const [knowledgeAreaId, setKnowledgeAreaId] = useState(question.knowledgeArea.id);
  const [options, setOptions] = useState(question.options);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setCorrect(letter: string) {
    setOptions((prev) =>
      prev.map((opt) => ({ ...opt, isCorrect: opt.letter === letter }))
    );
  }

  function updateOptionText(letter: string, value: string) {
    setOptions((prev) =>
      prev.map((opt) => (opt.letter === letter ? { ...opt, text: value } : opt))
    );
  }

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

      const response = await fetch(`${apiUrl}/admin/assessments/questions/${question.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          explanation: explanation || null,
          knowledgeAreaId,
          options: options.map((opt) => ({
            id: opt.id,
            letter: opt.letter,
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
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

      setMessage('Question saved.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <label className={styles.label}>
        Question
        <RichTextField
          value={text}
          onChange={setText}
          minHeight={120}
          previewLabel="Question preview"
        />
      </label>

      <label className={styles.label}>
        Knowledge area
        <select
          className={styles.input}
          value={knowledgeAreaId}
          onChange={(e) => setKnowledgeAreaId(e.target.value)}
        >
          {knowledgeAreas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.label}>
        Explanation (optional)
        <RichTextField
          value={explanation}
          onChange={setExplanation}
          minHeight={100}
          previewLabel="Explanation preview"
        />
      </label>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Answer options</legend>
        {options.map((opt) => (
          <div key={opt.id} className={styles.optionRow}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={opt.isCorrect}
                onChange={() => setCorrect(opt.letter)}
              />
              {opt.letter}
            </label>
            <input
              className={styles.input}
              value={opt.text}
              onChange={(e) => updateOptionText(opt.letter, e.target.value)}
            />
          </div>
        ))}
      </fieldset>

      <button type="button" className={styles.save} disabled={loading} onClick={save}>
        {loading ? 'Saving…' : 'Save question'}
      </button>

      {message ? <p className={styles.message}>{message}</p> : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
