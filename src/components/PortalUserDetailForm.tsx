'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { portalFetch } from '@/lib/portalFetch';
import { roleLabel } from '@/lib/roles';
import type {
  AdminPartnersResponse,
  AdminPortalUser,
  AdminSchoolsResponse,
  PortalUserRole,
} from '@/lib/types/admin';
import styles from './CreateSchoolForm.module.css';

type Props = {
  user: AdminPortalUser;
  schools: AdminSchoolsResponse['schools'];
  partners: AdminPartnersResponse['partners'];
};

const ROLES: PortalUserRole[] = ['staff', 'partner', 'school_admin', 'reviewer'];

export function PortalUserDetailForm({ user, schools, partners }: Props) {
  const router = useRouter();
  const isSuperAdminAccount = user.role === 'super_admin';
  const [fullName, setFullName] = useState(user.fullName);
  const [role, setRole] = useState<PortalUserRole>(
    user.role === 'super_admin' ? 'staff' : user.role,
  );
  const [schoolId, setSchoolId] = useState(user.schoolId ?? '');
  const [partnerId, setPartnerId] = useState(user.partnerId ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const needsSchool = role === 'school_admin';
  const needsPartner = role === 'partner';
  const isDeactivated = user.status === 'deactivated';

  const isComplete = useMemo(() => {
    if (!fullName.trim()) return false;
    if (needsSchool && !schoolId) return false;
    if (needsPartner && !partnerId) return false;
    return true;
  }, [fullName, needsSchool, needsPartner, schoolId, partnerId]);

  async function apiCall(path: string, method: string, body?: unknown) {
    return portalFetch(`/admin/users/${path}`, {
      method,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await apiCall(user.id, 'PATCH', {
        fullName: fullName.trim(),
        role,
        schoolId: needsSchool ? schoolId : null,
        partnerId: needsPartner ? partnerId : null,
      });
      setMessage('User updated.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await apiCall(`${user.id}/${isDeactivated ? 'reactivate' : 'deactivate'}`, 'POST', {});
      setMessage(isDeactivated ? 'User reactivated.' : 'User deactivated.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  }

  async function resetMfa() {
    if (!window.confirm('Reset MFA for this user? They must set up a new authenticator on next login.')) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await apiCall(`${user.id}/mfa/reset`, 'POST', {});
      setMessage('MFA reset. User must enroll a new authenticator on next login.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MFA reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.form}>
      <p className={styles.message}>
        {user.email} · {roleLabel(user.role)} ·{' '}
        {user.status === 'deactivated' ? 'Deactivated' : 'Active'}
        {user.mfaEnrolled === true ? ' · MFA enrolled' : user.mfaEnrolled === false ? ' · MFA not enrolled' : ''}
        {typeof user.unusedRecoveryCodes === 'number'
          ? ` · ${user.unusedRecoveryCodes} recovery code${user.unusedRecoveryCodes === 1 ? '' : 's'} left`
          : ''}
      </p>

      {isSuperAdminAccount ? (
        <p className={styles.message}>
          Super admin accounts are managed outside the Team page. Role changes, deactivation, and
          MFA reset are not available here.
        </p>
      ) : (
        <>
          <form onSubmit={save}>
        <div className={styles.grid}>
          <label className={styles.label}>
            Full name
            <input
              className={styles.input}
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isDeactivated}
            />
          </label>
          <label className={styles.label}>
            Role
            <select
              className={styles.input}
              value={role}
              onChange={(e) => setRole(e.target.value as PortalUserRole)}
              disabled={isDeactivated}
            >
              {ROLES.map((entry) => (
                <option key={entry} value={entry}>
                  {roleLabel(entry)}
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
                disabled={isDeactivated}
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
                disabled={isDeactivated}
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

        {!isDeactivated ? (
          <button className={styles.button} type="submit" disabled={loading || !isComplete}>
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        ) : null}
      </form>

      <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          className={styles.button}
          disabled={loading}
          onClick={toggleActive}
        >
          {isDeactivated ? 'Reactivate user' : 'Deactivate user'}
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={loading || isDeactivated}
          onClick={resetMfa}
        >
          Reset MFA
        </button>
      </div>

      {message ? <p className={styles.message}>{message}</p> : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
        </>
      )}
    </div>
  );
}
