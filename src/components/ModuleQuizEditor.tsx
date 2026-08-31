'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AdminModuleQuizQuestion } from '@/lib/types/admin';
import { RichTextField } from '@/components/RichTextField';
import styles from './QuestionEditForm.module.css';

const LETTERS = ['A', 'B', 'C', 'D'] as const;

type QuizOptionState = {
  letter: (typeof LETTERS)[number];
  text: string;
  isCorrect: boolean;
};

type QuizQuestionState = {
  orderIndex: number;
  text: string;
  options: QuizOptionState[];
};

type Props = {
  moduleId: string;
  initialQuestions: AdminModuleQuizQuestion[];
  canWrite: boolean;
};

function emptyQuestion(orderIndex: number): QuizQuestionState {
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

function fromApiQuestion(question: AdminModuleQuizQuestion): QuizQuestionState {
  const options = LETTERS.map((letter) => {
    const opt = question.options.find((o) => o.letter === letter);
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
    orderIndex: question.orderIndex,
    text: question.text,
    options,
  };
}

function renumberQuestions(questions: QuizQuestionState[]): QuizQuestionState[] {
  return questions.map((question, index) => ({
    ...question,
    orderIndex: index + 1,
  }));
}

function isQuestionComplete(question: QuizQuestionState) {
  return (
    question.text.trim().length > 0 &&
    question.options.every((o) => o.text.trim().length > 0) &&
    question.options.filter((o) => o.isCorrect).length === 1
  );
}

export function ModuleQuizEditor({ moduleId, initialQuestions, canWrite }: Props) {
  const router = useRouter();
  const [questions, setQuestions] = useState(() =>
    renumberQuestions(
      [...initialQuestions]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map(fromApiQuestion)
    )
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const readOnly = !canWrite;

  const isComplete = useMemo(
    () => questions.length > 0 && questions.every(isQuestionComplete),
    [questions]
  );

  function addQuestion() {
    setQuestions((prev) => renumberQuestions([...prev, emptyQuestion(prev.length + 1)]));
    setMessage(null);
    setError(null);
  }

  function removeQuestion(orderIndex: number) {
    setQuestions((prev) => renumberQuestions(prev.filter((q) => q.orderIndex !== orderIndex)));
    setMessage(null);
    setError(null);
  }

  function updateQuestionText(orderIndex: number, text: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.orderIndex === orderIndex ? { ...q, text } : q))
    );
  }

  function updateOptionText(orderIndex: number, letter: string, text: string) {
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

  function setCorrect(orderIndex: number, letter: string) {
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
        questions: renumberQuestions(questions).map((q) => ({
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

      setMessage(
        questions.length === 0 ? 'Quiz cleared.' : `Saved ${questions.length} question${questions.length === 1 ? '' : 's'}.`
      );
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
        Questions shown in the learner app after lessons and before the summary. Exactly one correct
        answer per question. Any saved questions must be complete before submit for review or
        publish.
      </p>

      {canWrite ? (
        <div className={styles.toolbar}>
          <button type="button" className={styles.addButton} onClick={addQuestion}>
            Add question
          </button>
        </div>
      ) : null}

      {questions.length === 0 ? (
        <p className={styles.hint}>
          {canWrite
            ? 'No quiz questions yet. Use Add question to create the first one.'
            : 'No quiz questions have been added for this module.'}
        </p>
      ) : null}

      {questions.map((question) => (
        <fieldset key={question.orderIndex} className={styles.fieldset}>
          <legend className={styles.legendRow}>
            <span>Question {question.orderIndex}</span>
            {canWrite ? (
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeQuestion(question.orderIndex)}
              >
                Remove
              </button>
            ) : null}
          </legend>

          <div className={styles.label}>
            Question text
            <RichTextField
              value={question.text}
              onChange={(value) => updateQuestionText(question.orderIndex, value)}
              readOnly={readOnly}
              minHeight={120}
              previewLabel="Question preview"
            />
          </div>

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
          disabled={loading || (questions.length > 0 && !isComplete)}
          onClick={save}
        >
          {loading ? 'Saving…' : questions.length === 0 ? 'Save (no quiz)' : 'Save quiz'}
        </button>
      ) : null}

      {canWrite && questions.length > 0 && !isComplete ? (
        <p className={styles.hint}>
          Fill in all questions and options, and mark one correct answer each.
        </p>
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
