import { redirect } from 'next/navigation';
import { SetPasswordForm } from '@/components/SetPasswordForm';
import { createClient } from '@/lib/supabase/server';
import styles from '../login/page.module.css';

export default async function SetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?error=reset_link_invalid');
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Safe Start for Young Drivers</p>
        <h1 className={styles.title}>New password</h1>
        <p className={styles.subtitle}>Set a new password for your Staff Portal account.</p>
        <SetPasswordForm />
      </div>
    </main>
  );
}
