'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { portalFetch } from '@/lib/portalFetch';
import type { AdminLearnerDetail } from '@/lib/types/admin';
import styles from './CreateSchoolForm.module.css';

type Props = {
  learner: AdminLearnerDetail;
};

export function LearnerDetailActions({ learner }: Props) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isDeleted = learner.status === 'deleted';
  const isSuspended = learner.status === 'suspended';

  async function runAction(
    path: string,
    confirmMessage: string,
    successMessage: string,
    body?: unknown
  ) {
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await portalFetch(`/admin/learners/${learner.id}/${path}`, {
        method: 'POST',
        body: body !== undefined ? JSON.stringify(body) : '{}',
      });
      setMessage(successMessage);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.form}>
      <section className={styles.section}>
        <h2 className={styles.title}>Account</h2>
        <dl className={styles.metaList}>
          <div>
            <dt>Email</dt>
            <dd>{learner.email}</dd>
          </div>
          <div>
            <dt>School</dt>
            <dd>{learner.schoolName ?? '—'}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd style={{ textTransform: 'capitalize' }}>{learner.status}</dd>
          </div>
          <div>
            <dt>Registered</dt>
            <dd>{new Date(learner.registeredAt).toLocaleString('en-AU')}</dd>
          </div>
          <div>
            <dt>Last active</dt>
            <dd>
              {learner.lastActiveAt
                ? new Date(learner.lastActiveAt).toLocaleString('en-AU')
                : '—'}
            </dd>
          </div>
          {learner.suspendedReason ? (
            <div>
              <dt>Suspension reason</dt>
              <dd>{learner.suspendedReason}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className={styles.section}>
        <h2 className={styles.title}>Progress</h2>
        <dl className={styles.metaList}>
          <div>
            <dt>Modules completed</dt>
            <dd>{learner.progress.modulesCompleted}</dd>
          </div>
          <div>
            <dt>Modules in progress</dt>
            <dd>{learner.progress.modulesInProgress}</dd>
          </div>
          <div>
            <dt>Course complete</dt>
            <dd>{learner.progress.courseCompleted ? 'Yes' : 'No'}</dd>
          </div>
        </dl>
      </section>

      {!isDeleted ? (
        <section className={styles.section}>
          <h2 className={styles.title}>Actions</h2>
          <p className={styles.help}>
            Suspend blocks sign-in until you unsuspend. Delete permanently anonymises personal data.
            Password reset sends an email — you will not see their new password.
          </p>

          {!isSuspended ? (
            <label className={styles.label}>
              Suspension reason (optional)
              <input
                className={styles.input}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={200}
                disabled={loading}
                placeholder="e.g. School request"
              />
            </label>
          ) : null}

          <div className={styles.actions}>
            {isSuspended ? (
              <button
                type="button"
                className={styles.secondary}
                disabled={loading}
                onClick={() =>
                  void runAction(
                    'unsuspend',
                    'Unsuspend this learner? They will be able to sign in again.',
                    'Learner unsuspended.'
                  )
                }
              >
                Unsuspend
              </button>
            ) : (
              <button
                type="button"
                className={styles.secondary}
                disabled={loading}
                onClick={() =>
                  void runAction(
                    'suspend',
                    'Suspend this learner? They cannot sign in until unsuspended.',
                    'Learner suspended.',
                    { reason: reason.trim() || null }
                  )
                }
              >
                Suspend
              </button>
            )}

            <button
              type="button"
              className={styles.secondary}
              disabled={loading}
              onClick={() =>
                void runAction(
                  'reset-password',
                  'Send a password reset email to this learner?',
                  'Password reset email sent.'
                )
              }
            >
              Send password reset
            </button>

            <button
              type="button"
              className={styles.secondary}
              disabled={loading}
              onClick={() =>
                void runAction(
                  'revoke-sessions',
                  'Sign this learner out on all devices?',
                  'Sessions revoked.'
                )
              }
            >
              Revoke sessions
            </button>

            <button
              type="button"
              className={styles.danger}
              disabled={loading}
              onClick={() =>
                void runAction(
                  'delete',
                  'Permanently anonymise this learner? This cannot be undone.',
                  'Learner deleted.'
                )
              }
            >
              Delete account
            </button>
          </div>
        </section>
      ) : (
        <p className={styles.help}>This account has been anonymised and cannot be restored.</p>
      )}

      {message ? <p className={styles.success}>{message}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
