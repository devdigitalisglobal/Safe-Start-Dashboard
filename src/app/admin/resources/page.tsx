import Link from 'next/link';
import { CreateResourceForm } from '@/components/CreateResourceForm';
import { PageHeader } from '@/components/PageHeader';
import { ResourceDeleteButton } from '@/components/ResourceDeleteButton';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import { contentResourcesCrumbs } from '@/lib/cmsBreadcrumbs';
import {
  CMS_RESOURCE_CATEGORY_LABELS,
  type CmsResourceCategory,
} from '@/lib/resourceCategories';
import type { AdminResourcesResponse } from '@/lib/types/admin';
import styles from '../modules/page.module.css';

export default async function AdminResourcesPage() {
  const { token } = await requireStaffUser();
  const data = await apiGetAdmin<AdminResourcesResponse>('resources', token);

  const grouped = data.items.reduce<Record<string, typeof data.items>>((acc, item) => {
    acc[item.category] ??= [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Learner resources"
        description="Manage checklists, guides, helpful links, and support content shown in the mobile app Resources tab."
        breadcrumbs={contentResourcesCrumbs()}
      />

      <CreateResourceForm />

      {(Object.keys(CMS_RESOURCE_CATEGORY_LABELS) as CmsResourceCategory[]).map((key) => {
        const items = grouped[key] ?? [];
        const label = CMS_RESOURCE_CATEGORY_LABELS[key];

        return (
          <section key={key}>
            <h2 className={styles.subheading}>{label}</h2>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Order</th>
                    <th>Updated</th>
                    <th />
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6}>No items yet.</td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.status}</td>
                        <td>{item.orderIndex}</td>
                        <td>{new Date(item.updatedAt).toLocaleDateString('en-AU')}</td>
                        <td>
                          <ResourceDeleteButton
                            resourceId={item.id}
                            resourceTitle={item.title}
                            compact
                          />
                        </td>
                        <td>
                          <Link className={styles.link} href={`/admin/resources/${item.id}`}>
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </>
  );
}
