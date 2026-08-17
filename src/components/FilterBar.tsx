'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { SchoolOption } from '@/lib/types/dashboard';
import styles from './FilterBar.module.css';

type Props = {
  schools: SchoolOption[];
  canPickSchool: boolean;
  lockedSchoolName?: string | null;
};

export function FilterBar({ schools, canPickSchool, lockedSchoolName }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get('from') ?? '');
  const [to, setTo] = useState(searchParams.get('to') ?? '');
  const [schoolId, setSchoolId] = useState(searchParams.get('schoolId') ?? '');

  function applyFilters() {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (schoolId) params.set('schoolId', schoolId);
    const query = params.toString();
    router.push(query ? `/?${query}` : '/');
  }

  function clearFilters() {
    setFrom('');
    setTo('');
    setSchoolId('');
    router.push('/');
  }

  return (
    <form
      className={styles.bar}
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
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>To</span>
          <input
            className={styles.input}
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>

        {canPickSchool ? (
          <label className={styles.field}>
            <span className={styles.label}>School</span>
            <select
              className={styles.input}
              value={schoolId}
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
        <button type="submit" className={styles.apply}>
          Apply filters
        </button>
        <button type="button" className={styles.clear} onClick={clearFilters}>
          Clear
        </button>
      </div>
    </form>
  );
}
