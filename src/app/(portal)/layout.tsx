import { PortalShell } from '@/components/PortalShell';
import { requirePortalUser } from '@/lib/auth';

export default async function PortalLayout({ children }: LayoutProps<'/'>) {
  const { profile } = await requirePortalUser();
  return <PortalShell profile={profile}>{children}</PortalShell>;
}
