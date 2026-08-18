'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  AdminPartnersResponse,
  AdminPortalUser,
  AdminSchoolsResponse,
  PortalUserRole,
} from '@/lib/types/admin';
import { FormError, FormMessage } from '@/components/FormFeedback';
import styles from './CreateSchoolForm.module.css';

type Props = {
  schools: AdminSchoolsResponse['schools'];
  partners: AdminPartnersResponse['partners'];
};

const ROLES: { value: PortalUserRole; label: string }[] = [
  { value: 'staff', label: 'Staff' },
  { value: 'partner', label: 'Partner' },
  { value: 'school_admin', label: 'School admin' },
  { value: 'reviewer', label: 'Content reviewer' },
];

export function InvitePortalUserForm({ schools, partners }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<PortalUserRole>('staff');
  const [schoolId, setSchoolId] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<(AdminPortalUser & { temporaryPassword: string | null }) | null>(
    null
  );

  const needsSchool = role === 'school_admin';
  const needsPartner = role === 'partner';

  const isComplete = useMemo(() => {
    if (!email.trim() || !fullName.trim()) return false;
    if (needsSchool && !schoolId) return false;
    if (needsPartner && !partnerId) return false;
    return true;
  }, [email, fullName, needsSchool, needsPartner, schoolId, partnerId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not signed in');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('API URL is not configured');

      const response = await fetch(`${apiUrl}/admin/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim(),
          role,
          schoolId: needsSchool ? schoolId : null,
          partnerId: needsPartner ? partnerId : null,
        }),
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

      const body = (await response.json()) as AdminPortalUser & { temporaryPassword: string | null };
      setCreated(body);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invite failed');
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    return (
      <div className={styles.form}>
        <h2 className={styles.title}>User created</h2>
        <p className={styles.message}>
          <strong>{created.fullName}</strong> ({created.email}) can sign in as{' '}
          {ROLES.find((r) => r.value === created.role)?.label ?? created.role}.
        </p>
        {created.temporaryPassword ? (
          <FormMessage>
            Temporary password (shown once): <code>{created.temporaryPassword}</code>
          </FormMessage>
        ) : (
          <FormMessage>
            An auth account already existed for this email — profile updated. Reset the password in
            Supabase if they cannot sign in.
          </FormMessage>
        )}
        <FormMessage>They must enroll MFA on first login.</FormMessage>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <h2 className={styles.title}>Invite portal user</h2>
      <div className={styles.grid}>
        <label className={styles.label}>
          Full name
          <input
            className={styles.input}
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>
        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className={styles.label}>
          Role
          <select
            className={styles.input}
            value={role}
            onChange={(e) => setRole(e.target.value as PortalUserRole)}
          >
            {ROLES.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>
        {needsSchool ? (
          <label className={styles.label}>
            School
            <select
              className={styles.input}
              required
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
            >
              <option value="">Select school…</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {needsPartner ? (
          <label className={styles.label}>
            Partner
            <select
              className={styles.input}
              required
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
            >
              <option value="">Select partner…</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <button className={styles.button} type="submit" disabled={loading || !isComplete}>
        {loading ? 'Creating…' : 'Create user'}
      </button>
      {error ? <FormError>{error}</FormError> : null}
    </form>
  );
}
