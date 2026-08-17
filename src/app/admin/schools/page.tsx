import Link from 'next/link';
import { CreateSchoolForm } from '@/components/CreateSchoolForm';
import { PageHeader } from '@/components/PageHeader';
import { apiGetAdmin } from '@/lib/api';
import { requireStaffUser } from '@/lib/auth';
import type { AdminSchoolsResponse } from '@/lib/types/admin';
import styles from '../modules/page.module.css';

export default async function AdminSchoolsPage() {
  const { token } = await requireStaffUser();
  const data = await apiGetAdmin<AdminSchoolsResponse>('schools', token);

  return (
    <>
      <PageHeader
        title="Schools"
        description="Add participating schools and send student invitations. Students can also join with a school invite code at signup."
      />

      <CreateSchoolForm />

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>School</th>
              <th>Partner</th>
              <th>Invite code</th>
              <th>Students</th>
              <th>Invitations</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.schools.map((school) => (
              <tr key={school.id}>
                <td>{school.name}</td>
                <td>{school.partnerName ?? 'Default'}</td>
                <td>{school.inviteCode}</td>
                <td>{school.studentCount}</td>
                <td>{school.invitationCount}</td>
                <td>
                  <Link className={styles.link} href={`/admin/schools/${school.id}`}>
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
