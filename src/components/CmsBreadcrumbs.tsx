import Link from 'next/link';
import type { CmsCrumb } from '@/lib/cmsBreadcrumbs';
import styles from './CmsBreadcrumbs.module.css';

type Props = {
  items: CmsCrumb[];
};

export function CmsBreadcrumbs({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <nav className={styles.nav} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className={styles.item}>
              {item.href && !isLast ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? styles.current : styles.text} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast ? <span className={styles.separator} aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
