import type { AdminUser } from '@/lib/types/auth.types';
import { LogoutButton } from './LogoutButton';

export function Topbar({ admin }: { admin: AdminUser }) {
  return (
    <header className="flex min-h-14 items-center justify-between border-b border-[var(--border)] bg-white px-4 sm:px-6 lg:px-8">
      <p className="text-sm text-[var(--muted)]">
        Signed in as <span className="font-semibold text-[var(--heading)]">{admin.name}</span>{' '}
        <span className="text-xs">({admin.role})</span>
      </p>
      <LogoutButton />
    </header>
  );
}
