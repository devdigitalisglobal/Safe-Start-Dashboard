import { DashboardOverviewSkeleton } from '@/components/DashboardOverviewSkeleton';
import { PageHeader } from '@/components/PageHeader';
import styles from './loading.module.css';

export default function PortalLoading() {
  return (
    <>
      <PageHeader
        title="Reporting overview"
        description="Program reach, learner engagement, and knowledge improvement across your schools."
      />
      <div className={styles.wrap}>
        <DashboardOverviewSkeleton />
      </div>
    </>
  );
}
