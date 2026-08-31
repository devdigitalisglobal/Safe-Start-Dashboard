'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type {
  AdminKnowledgeAreasResponse,
  AdminModuleSummary,
} from '@/lib/types/admin';
import { RichTextField } from '@/components/RichTextField';
import styles from './QuestionEditForm.module.css';

const LETTERS = ['A', 'B', 'C', 'D'] as const;

type Props = {
  assessmentType: string;
  knowledgeAreas: AdminKnowledgeAreasResponse['knowledgeAreas'];
  modules: AdminModuleSummary[];
};

export function QuestionCreateForm({ assessmentType, knowledgeAreas, modules }: Props) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [knowledgeAreaId, setKnowledgeAreaId] = useState(knowledgeAreas[0]?.id ?? '');
  const [moduleId, setModuleId] = useState('');
  const [options, setOptions] = useState(
    LETTERS.map((letter) => ({
      letter,
      text: '',
      isCorrect: letter === 'A',
    }))
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setCorrect(letter: string) {
    setOptions((prev) => prev.map((opt) => ({ ...opt, isCorrect: opt.letter === letter })));
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

      const response = await fetch(`${apiUrl}/admin/assessments/${assessmentType}/questions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          explanation: explanation.trim() || null,
          knowledgeAreaId,
          moduleId: moduleId || null,
          options: options.map((opt) => ({
            letter: opt.letter,
            text: opt.text.trim(),
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

      const body = (await response.json()) as { id: string };
      setMessage('Question created.');
      router.push(`/admin/assessments/${assessmentType}/questions/${body.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setLoading(false);
    }
  }

  const isComplete =
    text.trim().length > 0 &&
    knowledgeAreaId.length > 0 &&
    options.every((opt) => opt.text.trim().length > 0) &&
    options.filter((opt) => opt.isCorrect).length === 1;

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>
        Question
        <RichTextField
          value={text}
          onChange={setText}
          minHeight={120}
          previewLabel="Question preview"
        />
      </div>

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
        Related module (optional)
        <select className={styles.input} value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
          <option value="">None</option>
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.label}>
        Explanation (optional)
        <RichTextField
          value={explanation}
          onChange={setExplanation}
          minHeight={100}
          previewLabel="Explanation preview"
        />
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Answer options</legend>
        {options.map((opt) => (
          <div key={opt.letter} className={styles.optionRow}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="correct-new"
                checked={opt.isCorrect}
                onChange={() => setCorrect(opt.letter)}
              />
              {opt.letter}
            </label>
            <input
              className={styles.input}
              value={opt.text}
              onChange={(e) => updateOptionText(opt.letter, e.target.value)}
              placeholder={`Option ${opt.letter}`}
            />
          </div>
        ))}
      </fieldset>

      <button type="button" className={styles.save} disabled={loading || !isComplete} onClick={save}>
        {loading ? 'Creating…' : 'Create question'}
      </button>

      {!isComplete ? (
        <p className={styles.hint}>
          Fill in the question, all four options, and mark one correct answer.
        </p>
      ) : null}

      {message ? <p className={styles.message}>{message}</p> : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
