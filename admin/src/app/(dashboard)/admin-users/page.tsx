import Link from 'next/link';
import { getAdminUsers } from '@/lib/api/admin-users.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { RoleGate } from '@/components/common/RoleGate';
import { AdminUsersTable } from '@/components/admin-users/AdminUsersTable';
import { deactivateAdminUserAction, reactivateAdminUserAction } from './actions';

export default async function AdminUsersPage() {
  const token = await getServerToken();
  const accounts = await getAdminUsers(token);

  return (
    <div>
      <SectionHeading
        title="Admin accounts"
        description={`${accounts.length} accounts — visible to Super Admins only`}
        action={
          <RoleGate permission="adminUsers.write">
            <Link
              href="/admin-users/new"
              className="min-h-11 inline-flex items-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
            >
              New account
            </Link>
          </RoleGate>
        }
      />

      <AdminUsersTable
        accounts={accounts}
        deactivateAction={deactivateAdminUserAction}
        reactivateAction={reactivateAdminUserAction}
      />
    </div>
  );
}
