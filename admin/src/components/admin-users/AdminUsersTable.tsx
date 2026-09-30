'use client';

import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { useAdminAuth } from '@/lib/auth/AdminAuthContext';
import type { AdminUserAccount } from '@/lib/types/admin-user.types';

const ROLE_TONE = {
  SUPER_ADMIN: 'danger',
  ADMIN: 'brand',
  EDITOR: 'neutral',
  PARTNER: 'warning',
} as const;

export function AdminUsersTable({
  accounts,
  deactivateAction,
  reactivateAction,
}: {
  accounts: AdminUserAccount[];
  deactivateAction: (formData: FormData) => void | Promise<void>;
  reactivateAction: (formData: FormData) => void | Promise<void>;
}) {
  const currentAdmin = useAdminAuth();
  const currentAdminId = currentAdmin.id;

  if (accounts.length === 0) {
    return <EmptyState title="No admin accounts" />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Last login</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.id} className="border-b border-[var(--border)] last:border-0">
              <td className="px-4 py-3 font-medium text-[var(--heading)]">
                {account.name}
                {account.id === currentAdminId ? (
                  <span className="ml-2 text-xs font-normal text-[var(--muted)]">(you)</span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-[var(--muted)]">{account.email}</td>
              <td className="px-4 py-3">
                <Badge tone={ROLE_TONE[account.role]}>{account.role}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge tone={account.isActive ? 'brand' : 'neutral'}>
                  {account.isActive ? 'Active' : 'Deactivated'}
                </Badge>
              </td>
              <td className="px-4 py-3 text-[var(--muted)]">
                {account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleDateString() : 'Never'}
              </td>
              <td className="px-4 py-3">
                {account.id === currentAdminId ? (
                  <span className="text-[var(--muted)]">—</span>
                ) : account.isActive ? (
                  <form action={deactivateAction}>
                    <input type="hidden" name="id" value={account.id} />
                    <button type="submit" className="font-semibold text-[var(--danger)]">
                      Deactivate
                    </button>
                  </form>
                ) : (
                  <form action={reactivateAction}>
                    <input type="hidden" name="id" value={account.id} />
                    <button type="submit" className="font-semibold text-[var(--brand)]">
                      Reactivate
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
