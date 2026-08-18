'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AdminModuleQuizQuestion } from '@/lib/types/admin';
import styles from './QuestionEditForm.module.css';

const LETTERS = ['A', 'B', 'C', 'D'] as const;

type QuizOptionState = {
  letter: (typeof LETTERS)[number];
  text: string;
  isCorrect: boolean;
};

type QuizQuestionState = {
  orderIndex: 1 | 2 | 3;
  text: string;
  options: QuizOptionState[];
};

type Props = {
  moduleId: string;
  initialQuestions: AdminModuleQuizQuestion[];
  canWrite: boolean;
};

function emptyQuestion(orderIndex: 1 | 2 | 3): QuizQuestionState {
  return {
    orderIndex,
    text: '',
    options: LETTERS.map((letter) => ({
      letter,
      text: '',
      isCorrect: letter === 'A',
    })),
  };
}

function normalizeQuestions(questions: AdminModuleQuizQuestion[]): QuizQuestionState[] {
  const byOrder = new Map(questions.map((q) => [q.orderIndex, q]));
  return ([1, 2, 3] as const).map((orderIndex) => {
    const existing = byOrder.get(orderIndex);
    if (!existing) return emptyQuestion(orderIndex);

    const options = LETTERS.map((letter) => {
      const opt = existing.options.find((o) => o.letter === letter);
      return {
        letter,
        text: opt?.text ?? '',
        isCorrect: opt?.isCorrect ?? false,
      };
    });

    if (!options.some((o) => o.isCorrect)) {
      options[0].isCorrect = true;
    }

    return {
      orderIndex,
      text: existing.text,
      options,
    };
  });
}

export function ModuleQuizEditor({ moduleId, initialQuestions, canWrite }: Props) {
  const router = useRouter();
  const [questions, setQuestions] = useState(() => normalizeQuestions(initialQuestions));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const readOnly = !canWrite;

  const isComplete = useMemo(
    () =>
      questions.every(
        (q) =>
          q.text.trim().length > 0 &&
          q.options.every((o) => o.text.trim().length > 0) &&
          q.options.filter((o) => o.isCorrect).length === 1
      ),
    [questions]
  );

  function updateQuestionText(orderIndex: 1 | 2 | 3, text: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.orderIndex === orderIndex ? { ...q, text } : q))
    );
  }

  function updateOptionText(orderIndex: 1 | 2 | 3, letter: string, text: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.orderIndex === orderIndex
          ? {
              ...q,
              options: q.options.map((o) => (o.letter === letter ? { ...o, text } : o)),
            }
          : q
      )
    );
  }

  function setCorrect(orderIndex: 1 | 2 | 3, letter: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.orderIndex === orderIndex
          ? {
              ...q,
              options: q.options.map((o) => ({ ...o, isCorrect: o.letter === letter })),
            }
          : q
      )
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

      const payload = {
        questions: questions.map((q) => ({
          orderIndex: q.orderIndex,
          text: q.text.trim(),
          options: q.options.map((o) => ({
            letter: o.letter,
            text: o.text.trim(),
            isCorrect: o.isCorrect,
          })),
        })),
      };

      const response = await fetch(`${apiUrl}/admin/modules/${moduleId}/quiz`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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

      setMessage('Module quiz saved.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.wrap}>
      <p className={styles.intro}>
        Three questions shown in the learner app after lessons and before the summary. Exactly one
        correct answer per question. Required before submit for review or publish.
      </p>

      {questions.map((question) => (
        <fieldset key={question.orderIndex} className={styles.fieldset}>
          <legend className={styles.legend}>Question {question.orderIndex}</legend>

          <label className={styles.label}>
            Question text
            <textarea
              className={styles.textarea}
              rows={3}
              value={question.text}
              onChange={(e) => updateQuestionText(question.orderIndex, e.target.value)}
              readOnly={readOnly}
            />
          </label>

          {question.options.map((option) => (
            <div key={option.letter} className={styles.optionRow}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name={`correct-${question.orderIndex}`}
                  checked={option.isCorrect}
                  onChange={() => setCorrect(question.orderIndex, option.letter)}
                  disabled={readOnly}
                />
                {option.letter}
              </label>
              <input
                className={styles.input}
                value={option.text}
                onChange={(e) =>
                  updateOptionText(question.orderIndex, option.letter, e.target.value)
                }
                readOnly={readOnly}
                placeholder={`Option ${option.letter}`}
              />
            </div>
          ))}
        </fieldset>
      ))}

      {canWrite ? (
        <button
          type="button"
          className={styles.save}
          disabled={loading || !isComplete}
          onClick={save}
        >
          {loading ? 'Saving…' : 'Save quiz'}
        </button>
      ) : null}

      {canWrite && !isComplete ? (
        <p className={styles.hint}>Fill in all questions and options, and mark one correct answer each.</p>
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
    </section>
  );
}
