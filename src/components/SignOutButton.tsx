'use client';

import { useRouter } from 'next/navigation';
import { signOutPortal } from '@/lib/portalSignOut';
import styles from './SignOutButton.module.css';

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOutPortal();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleSignOut}
      aria-label="Sign out"
    >
      Sign out
    </button>
  );
}
