import Link from 'next/link';
import { CmsBreadcrumbs } from '@/components/CmsBreadcrumbs';
import type { CmsCrumb } from '@/lib/cmsBreadcrumbs';
import styles from './PageHeader.module.css';

type Props = {
  title: string;
  description?: string;
  breadcrumbs?: CmsCrumb[];
  backHref?: string;
  backLabel?: string;
};

export function PageHeader({
  title,
  description,
  breadcrumbs,
  backHref,
  backLabel = 'Back',
}: Props) {
  return (
    <header className={styles.header}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <CmsBreadcrumbs items={breadcrumbs} />
      ) : backHref ? (
        <Link href={backHref} className={styles.back}>
          ← {backLabel}
        </Link>
      ) : null}
      <h1 className={styles.title}>{title}</h1>
      {description ? <p className={styles.description}>{description}</p> : null}
    </header>
  );
}
