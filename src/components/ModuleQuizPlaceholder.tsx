import Link from 'next/link';
import styles from './ModuleQuizPlaceholder.module.css';

type Props = {
  canWrite: boolean;
};

/** Phase 3 replaces this with ModuleQuizEditor. */
export function ModuleQuizPlaceholder({ canWrite }: Props) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Module quiz</h2>
      <p className={styles.body}>
        Each module includes three multiple-choice questions in the learner app after the lessons
        and before the summary. Quiz editing in the Staff Portal ships in Phase 3.
      </p>
      <ul className={styles.list}>
        <li>3 questions per module</li>
        <li>4 options (A–D) with one correct answer</li>
        <li>Learners see feedback after submit (instant per-question in app)</li>
      </ul>
      {canWrite ? (
        <p className={styles.note}>
          Until the editor is live, quiz content is managed via the API seed script. Published
          modules must have a complete quiz before learners can finish the module.
        </p>
      ) : (
        <p className={styles.note}>Read-only — reviewers can preview quiz requirements here.</p>
      )}
      <Link href="/admin/modules" className={styles.link}>
        ← Back to all modules
      </Link>
    </section>
  );
}
