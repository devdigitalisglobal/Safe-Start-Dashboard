import { ModuleDeleteButton } from '@/components/ModuleDeleteButton';
import { ModuleEditForm } from '@/components/ModuleEditForm';
import { PageHeader } from '@/components/PageHeader';
import { apiGetAdmin } from '@/lib/api';
import { isStaffRole, requireCmsUser } from '@/lib/auth';
import type { AdminModuleDetail } from '@/lib/types/admin';
import styles from '../page.module.css';
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminModuleEditPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const initialLessonId =
    typeof query.lesson === 'string' ? query.lesson : undefined;
  const { token, profile } = await requireCmsUser();
  const module = await apiGetAdmin<AdminModuleDetail>(`modules/${id}`, token);

  const canWrite = isStaffRole(profile.role);
  const canReview = profile.role === 'reviewer';

  return (
    <>
      <PageHeader
        title={`Module ${module.orderIndex}: ${module.title}`}
        description={
          canWrite
            ? 'Update copy, manage lessons, and use the workflow steps to publish.'
            : 'Read-only content view. Use the workflow actions to approve or reject.'
        }
        backHref="/admin/modules"
        backLabel="All modules"
      />

      {canWrite ? (
        <div className={styles.deleteWrap}>
          <ModuleDeleteButton moduleId={module.id} moduleTitle={module.title} />
        </div>
      ) : null}

      <ModuleEditForm
        key={`${module.id}-${module.lessons.length}-${module.updatedAt}`}
        module={module}
        canWrite={canWrite}
        canReview={canReview}
        initialLessonId={initialLessonId}
      />
    </>
  );
}
