'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import type { SchoolOption } from '@/lib/types/dashboard';
import styles from './FilterBar.module.css';

type Props = {
  schools: SchoolOption[];
  canPickSchool: boolean;
  lockedSchoolName?: string | null;
};

function buildFilterHref(from: string, to: string, schoolId: string) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (schoolId) params.set('schoolId', schoolId);
  const query = params.toString();
  return query ? `/?${query}` : '/';
}

export function FilterBar({ schools, canPickSchool, lockedSchoolName }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [from, setFrom] = useState(searchParams.get('from') ?? '');
  const [to, setTo] = useState(searchParams.get('to') ?? '');
  const [schoolId, setSchoolId] = useState(searchParams.get('schoolId') ?? '');

  useEffect(() => {
    setFrom(searchParams.get('from') ?? '');
    setTo(searchParams.get('to') ?? '');
    setSchoolId(searchParams.get('schoolId') ?? '');
  }, [searchParams]);

  function navigate(nextFrom: string, nextTo: string, nextSchoolId: string) {
    startTransition(() => {
      router.push(buildFilterHref(nextFrom, nextTo, nextSchoolId));
    });
  }

  function applyFilters() {
    navigate(from, to, schoolId);
  }

  function clearFilters() {
    setFrom('');
    setTo('');
    setSchoolId('');
    navigate('', '', '');
  }

  const hasActiveFilters = Boolean(from || to || schoolId);

  return (
    <form
      className={styles.bar}
      aria-busy={isPending}
      onSubmit={(e) => {
        e.preventDefault();
        applyFilters();
      }}
    >
      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.label}>From</span>
          <input
            className={styles.input}
            type="date"
            value={from}
            disabled={isPending}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>To</span>
          <input
            className={styles.input}
            type="date"
            value={to}
            disabled={isPending}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>

        {canPickSchool ? (
          <label className={styles.field}>
            <span className={styles.label}>School</span>
            <select
              className={styles.input}
              value={schoolId}
              disabled={isPending}
              onChange={(e) => setSchoolId(e.target.value)}
            >
              <option value="">All schools</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </label>
        ) : lockedSchoolName ? (
          <div className={styles.field}>
            <span className={styles.label}>School</span>
            <p className={styles.locked}>{lockedSchoolName}</p>
          </div>
        ) : null}
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.apply} disabled={isPending}>
          {isPending ? 'Applying…' : 'Apply filters'}
        </button>
        <button type="button" className={styles.clear} disabled={isPending} onClick={clearFilters}>
          Clear
        </button>
      </div>

      {isPending ? (
        <p className={styles.status} role="status">
          Updating report…
        </p>
      ) : hasActiveFilters ? (
        <p className={styles.statusMuted}>Filtered view</p>
      ) : null}
    </form>
  );
}
