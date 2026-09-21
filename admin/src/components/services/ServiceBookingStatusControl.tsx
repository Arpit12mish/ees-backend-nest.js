'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateServiceBookingStatus } from '@/lib/api/services.api';
import { getClientToken } from '@/lib/auth/token-cookie';
import { RoleGate } from '@/components/common/RoleGate';
import { ErrorState } from '@/components/common/ErrorState';
import type { ServiceBooking, ServiceBookingStatus } from '@/lib/types/service.types';

const STATUSES: ServiceBookingStatus[] = [
  'NEW',
  'CONTACTED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
];

export function ServiceBookingStatusControl({ booking }: { booking: ServiceBooking }) {
  const router = useRouter();
  const [status, setStatus] = useState<ServiceBookingStatus>(booking.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await updateServiceBookingStatus(booking.id, status, getClientToken());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update status');
    } finally {
      setSaving(false);
    }
  }

  return (
    <RoleGate
      permission="serviceBookings.write"
      fallback={<p className="text-sm text-[var(--muted)]">Read-only for your role.</p>}
    >
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ServiceBookingStatus)}
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || status === booking.status}
          className="min-h-11 rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Updating…' : 'Update status'}
        </button>
      </div>
      {error ? <div className="mt-2"><ErrorState title="Could not update" description={error} /></div> : null}
    </RoleGate>
  );
}
