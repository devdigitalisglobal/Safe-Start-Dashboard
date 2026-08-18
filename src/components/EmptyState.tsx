import Link from 'next/link';
import styles from './EmptyState.module.css';

type Action = {
  label: string;
  href: string;
};

type Props = {
  title: string;
  description: string;
  action?: Action;
  secondaryAction?: Action;
};

export function EmptyState({ title, description, action, secondaryAction }: Props) {
  return (
    <section className={styles.wrap} aria-labelledby="empty-state-title">
      <h2 id="empty-state-title" className={styles.title}>
        {title}
      </h2>
      <p className={styles.description}>{description}</p>
      {action || secondaryAction ? (
        <div className={styles.actions}>
          {action ? (
            <Link href={action.href} className={styles.primary}>
              {action.label}
            </Link>
          ) : null}
          {secondaryAction ? (
            <Link href={secondaryAction.href} className={styles.secondary}>
              {secondaryAction.label}
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
