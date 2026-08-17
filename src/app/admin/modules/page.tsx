import Link from 'next/link';
import { CreateModuleForm } from '@/components/CreateModuleForm';
import { ModuleDeleteButton } from '@/components/ModuleDeleteButton';
import { ModuleReorderList } from '@/components/ModuleReorderList';
import { PageHeader } from '@/components/PageHeader';
import { apiGetAdmin } from '@/lib/api';
import { isStaffRole, requireCmsUser } from '@/lib/auth';
import type { AdminModulesResponse } from '@/lib/types/admin';
import styles from './page.module.css';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminModulesPage({ searchParams }: Props) {
  const params = await searchParams;
  const staffOnlyNotice = params.error === 'staff_only';
  const { token, profile } = await requireCmsUser();
  const data = await apiGetAdmin<AdminModulesResponse>('modules', token);
  const canWrite = isStaffRole(profile.role);

  return (
    <>
      <PageHeader
        title={canWrite ? 'Modules' : 'Modules to review'}
        description={
          canWrite
            ? 'Create, edit, reorder, and remove modules. Move drafts through review before publishing to the learner app.'
            : 'Review modules submitted by staff. Approve when ready, or send back to draft with notes.'
        }
      />

      {staffOnlyNotice ? (
        <p className={styles.notice} role="status">
          That section is limited to staff editors. Use the menu on the left to navigate.
        </p>
      ) : null}

      {canWrite ? <CreateModuleForm /> : null}

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Status</th>
              <th>Lessons</th>
              <th>Updated</th>
              {canWrite ? <th /> : null}
              <th />
            </tr>
          </thead>
          <tbody>
            {data.modules.map((module) => (
              <tr key={module.id}>
                <td>{module.orderIndex}</td>
                <td>{module.title}</td>
                <td>
                  <span className={styles.status}>{module.status}</span>
                </td>
                <td>{module.lessonCount}</td>
                <td>{new Date(module.updatedAt).toLocaleDateString('en-AU')}</td>
                {canWrite ? (
                  <td>
                    <ModuleDeleteButton
                      moduleId={module.id}
                      moduleTitle={module.title}
                      compact
                    />
                  </td>
                ) : null}
                <td>
                  <Link className={styles.link} href={`/admin/modules/${module.id}`}>
                    {canWrite ? 'Edit' : module.status === 'review' ? 'Review' : 'View'}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canWrite ? (
        <>
          <h2 className={styles.subheading}>Module order</h2>
          <ModuleReorderList modules={data.modules} />
        </>
      ) : null}
    </>
  );
}
