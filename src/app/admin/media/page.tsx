import { MediaLibraryGrid } from '@/components/MediaLibraryGrid';
import { MediaUploadForm } from '@/components/MediaUploadForm';
import { PageHeader } from '@/components/PageHeader';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import type { AdminMediaResponse } from '@/lib/types/admin';

export default async function AdminMediaPage() {
  const { token } = await requireStaffUser();
  const data = await apiGetAdmin<AdminMediaResponse>('media', token);

  return (
    <>
      <PageHeader
        title="Media library"
        description="Upload images for modules and lessons. Alt text is required on every upload for accessibility."
      />

      <MediaUploadForm />
      <MediaLibraryGrid assets={data.assets} />
    </>
  );
}
