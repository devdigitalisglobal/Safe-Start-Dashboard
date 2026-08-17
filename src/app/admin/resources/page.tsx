import { CreateResourceForm } from '@/components/CreateResourceForm';
import { PageHeader } from '@/components/PageHeader';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import type { AdminResourcesResponse } from '@/lib/types/admin';
import styles from '../modules/page.module.css';

const CATEGORY_LABELS: Record<string, string> = {
  checklists: 'Checklists',
  resources: 'Resources',
  helpful_links: 'Helpful Links',
  support: 'Support',
};

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
        description="Manage checklists, resources, helpful links, and support content shown in the mobile app Resources tab."
      />

      <CreateResourceForm />

      {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
        const items = grouped[key] ?? [];
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
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4}>No items yet.</td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.status}</td>
                        <td>{item.orderIndex}</td>
                        <td>{new Date(item.updatedAt).toLocaleDateString('en-AU')}</td>
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
