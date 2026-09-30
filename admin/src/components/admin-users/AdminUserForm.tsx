'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminUser } from '@/lib/api/admin-users.api';
import { getClientToken } from '@/lib/auth/token-cookie';
import { ErrorState } from '@/components/common/ErrorState';
import type { AdminRoleValue } from '@/lib/types/auth.types';

const ROLES: { value: AdminRoleValue; label: string; hint: string }[] = [
  { value: 'PARTNER', label: 'Partner', hint: 'Products, images, and SEO only — no orders, no other admin accounts' },
  { value: 'EDITOR', label: 'Editor', hint: 'Products, content, and marketing sections — no orders, coupons, or inventory' },
  { value: 'ADMIN', label: 'Admin', hint: 'Everything except managing other admin accounts' },
  { value: 'SUPER_ADMIN', label: 'Super Admin', hint: 'Full access, including other admin accounts' },
];

export function AdminUserForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRoleValue>('PARTNER');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createAdminUser({ name, email, password, role }, getClientToken());
      router.push('/admin-users');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">Temporary password</label>
        <input
          required
          minLength={10}
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 10 characters"
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
        <p className="mt-1 text-xs text-[var(--muted)]">Share this with them directly — it isn&apos;t emailed automatically.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--heading)]">Role</label>
        <div className="mt-2 grid gap-2">
          {ROLES.map((r) => (
            <label
              key={r.value}
              className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm ${
                role === r.value ? 'border-[var(--brand)] bg-[var(--soft)]' : 'border-[var(--border)]'
              }`}
            >
              <input
                type="radio"
                name="role"
                checked={role === r.value}
                onChange={() => setRole(r.value)}
                className="mt-0.5"
              />
              <span>
                <span className="block font-medium text-[var(--heading)]">{r.label}</span>
                <span className="block text-xs text-[var(--muted)]">{r.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {error ? <ErrorState title="Could not create account" description={error} /> : null}

      <button
        type="submit"
        disabled={saving}
        className="min-h-11 rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Creating…' : 'Create account'}
      </button>
    </form>
  );
}
