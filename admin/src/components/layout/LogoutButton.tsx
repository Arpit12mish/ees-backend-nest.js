'use client';

import { useRouter } from 'next/navigation';
import { clearClientToken } from '@/lib/auth/token-cookie';

export function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    clearClientToken();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="min-h-9 rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--heading)] hover:border-[var(--brand)]"
    >
      Log out
    </button>
  );
}
