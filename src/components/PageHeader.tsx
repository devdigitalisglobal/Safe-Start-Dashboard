import Link from 'next/link';
import styles from './PageHeader.module.css';

type Props = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
};

export function PageHeader({ title, description, backHref, backLabel = 'Back' }: Props) {
  return (
    <header className={styles.header}>
      {backHref ? (
        <Link href={backHref} className={styles.back}>
          ← {backLabel}
        </Link>
      ) : null}
      <h1 className={styles.title}>{title}</h1>
      {description ? <p className={styles.description}>{description}</p> : null}
    </header>
  );
}
