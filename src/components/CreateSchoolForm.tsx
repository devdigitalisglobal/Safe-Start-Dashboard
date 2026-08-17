'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './CreateSchoolForm.module.css';

export function CreateSchoolForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not signed in');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('API URL is not configured');

      const body: Record<string, string> = { name };
      if (state.trim()) body.state = state.trim().toUpperCase();
      if (contactEmail.trim()) body.contactEmail = contactEmail.trim();
      if (inviteCode.trim()) body.inviteCode = inviteCode.trim().toUpperCase();

      const response = await fetch(`${apiUrl}/admin/schools`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let detail = response.statusText;
        try {
          const payload = (await response.json()) as { message?: string };
          detail = payload.message ?? detail;
        } catch {
          // ignore
        }
        throw new Error(detail);
      }

      const created = (await response.json()) as { inviteCode: string };
      setName('');
      setState('');
      setContactEmail('');
      setInviteCode('');
      setMessage(`School created. Invite code: ${created.inviteCode}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create school');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <h2 className={styles.title}>Add school</h2>
      <div className={styles.grid}>
        <label className={styles.label}>
          Name
          <input
            className={styles.input}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className={styles.label}>
          State
          <input
            className={styles.input}
            placeholder="NSW"
            maxLength={10}
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </label>
        <label className={styles.label}>
          Contact email
          <input
            className={styles.input}
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </label>
        <label className={styles.label}>
          Invite code (optional)
          <input
            className={styles.input}
            placeholder="Auto-generated if blank"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          />
        </label>
      </div>
      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? 'Creating…' : 'Create school'}
      </button>
      {message ? <p className={styles.message}>{message}</p> : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
