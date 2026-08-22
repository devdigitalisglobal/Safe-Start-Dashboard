import { PageHeader } from '@/components/PageHeader';
import { ResourceEditForm } from '@/components/ResourceEditForm';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import { contentResourcesCrumbs } from '@/lib/cmsBreadcrumbs';
import type { AdminResourceItem } from '@/lib/types/admin';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminResourceEditPage({ params }: Props) {
  const { id } = await params;
  const { token } = await requireStaffUser();

  let item: AdminResourceItem;
  try {
    item = await apiGetAdmin<AdminResourceItem>(`resources/${id}`, token);
  } catch {
    return (
      <PageHeader
        title="Resource not found"
        description="This item may have been removed. Go back to the resources list."
        breadcrumbs={[...contentResourcesCrumbs(), { label: 'Not found' }]}
      />
    );
  }

  return (
    <>
      <PageHeader
        title={item.title}
        description={`${item.status === 'published' ? 'Published' : 'Draft'} · order ${item.orderIndex}`}
        breadcrumbs={[...contentResourcesCrumbs(), { label: item.title }]}
      />

      <ResourceEditForm item={item} />
    </>
  );
}
