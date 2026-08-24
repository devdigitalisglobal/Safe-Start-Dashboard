import { PortalSessionGuard } from '@/components/PortalSessionGuard';

/** Minimal wrapper — MFA page supplies its own full layout. */
export default function AccountLayout({ children }: LayoutProps<'/account'>) {
  return <PortalSessionGuard>{children}</PortalSessionGuard>;
}
