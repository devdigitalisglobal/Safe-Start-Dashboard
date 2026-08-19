import styles from './DashboardOverviewSkeleton.module.css';

export function FilterBarSkeleton() {
  return <div className={styles.filter} aria-hidden="true" />;
}

export function HeadlineTilesSkeleton() {
  return (
    <div className={styles.grid} aria-hidden="true">
      <div className={styles.tile} />
      <div className={styles.tile} />
      <div className={styles.tile} />
    </div>
  );
}

export function SectionSkeleton() {
  return <div className={styles.section} aria-hidden="true" />;
}

export function DashboardOverviewSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading reporting data">
      <FilterBarSkeleton />
      <HeadlineTilesSkeleton />
      <SectionSkeleton />
      <SectionSkeleton />
    </div>
  );
}
