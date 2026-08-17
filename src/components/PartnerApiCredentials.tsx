'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AdminPartnerCredential, AdminPartnerCredentialsResponse } from '@/lib/types/admin';
import styles from './BrandingForm.module.css';

type Props = {
  partnerId: string;
  credentials: AdminPartnerCredential[];
};

export function PartnerApiCredentials({ partnerId, credentials }: Props) {
  const router = useRouter();
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [issuedSecret, setIssuedSecret] = useState<{
    clientId: string;
    clientSecret: string;
  } | null>(null);

  async function createCredential() {
    setLoading(true);
    setError(null);
    setMessage(null);
    setIssuedSecret(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not signed in');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('API URL is not configured');

      const response = await fetch(`${apiUrl}/admin/partners/${partnerId}/credentials`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ label: label.trim() || undefined }),
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

      const payload = (await response.json()) as {
        clientId: string;
        clientSecret: string;
      };
      setIssuedSecret({ clientId: payload.clientId, clientSecret: payload.clientSecret });
      setLabel('');
      setMessage('API credential created. Copy the secret now — it will not be shown again.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setLoading(false);
    }
  }

  async function revokeCredential(credentialId: string) {
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

      const response = await fetch(
        `${apiUrl}/admin/partners/${partnerId}/credentials/${credentialId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Revoke failed');
      }

      setMessage('Credential revoked.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revoke failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.sectionTitle}>Partner API credentials</h2>
      <p className={styles.help}>
        OAuth client credentials for machine-to-machine access to aggregate reporting endpoints at{' '}
        <code>/partner/v1</code>.
      </p>

      <label className={styles.label}>
        Label (optional)
        <input className={styles.input} value={label} onChange={(e) => setLabel(e.target.value)} />
      </label>

      <button type="button" className={styles.button} disabled={loading} onClick={createCredential}>
        {loading ? 'Creating…' : 'Issue credential'}
      </button>

      {issuedSecret ? (
        <div className={styles.secretBox} role="status">
          <p>
            <strong>Client ID:</strong> {issuedSecret.clientId}
          </p>
          <p>
            <strong>Client secret:</strong> {issuedSecret.clientSecret}
          </p>
        </div>
      ) : null}

      {credentials.length > 0 ? (
        <ul className={styles.credentialList}>
          {credentials.map((credential) => (
            <li key={credential.id} className={styles.credentialItem}>
              <div>
                <strong>{credential.clientId}</strong>
                {credential.label ? ` — ${credential.label}` : ''}
                <div className={styles.credentialMeta}>
                  {credential.status}
                  {credential.lastUsedAt
                    ? ` · last used ${new Date(credential.lastUsedAt).toLocaleDateString('en-AU')}`
                    : ''}
                </div>
              </div>
              {credential.status === 'active' ? (
                <button
                  type="button"
                  className={styles.clear}
                  disabled={loading}
                  onClick={() => revokeCredential(credential.id)}
                >
                  Revoke
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.help}>No credentials yet.</p>
      )}

      {message ? (
        <p className={styles.message} role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
