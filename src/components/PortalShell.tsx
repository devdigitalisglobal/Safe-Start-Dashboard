import type { UserProfile } from '@/lib/types/dashboard';
import { PortalChrome } from './PortalChrome';
import styles from './PortalShell.module.css';

type Props = {
  profile: UserProfile;
  children: React.ReactNode;
};

export function PortalShell({ profile, children }: Props) {
  return (
    <div className={styles.root}>
      <PortalChrome profile={profile}>{children}</PortalChrome>
    </div>
  );
}
