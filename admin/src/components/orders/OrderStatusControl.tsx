'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '@/lib/api/orders.api';
import { getClientToken } from '@/lib/auth/token-cookie';
import { useAdminAuth } from '@/lib/auth/AdminAuthContext';
import { RoleGate } from '@/components/common/RoleGate';
import { ErrorState } from '@/components/common/ErrorState';
import {
  ALLOWED_TRANSITIONS,
  ALL_ORDER_STATUSES,
  PAYMENT_REQUIRED_STATUSES,
  type OrderDetail,
  type OrderStatus,
} from '@/lib/types/order.types';

export function OrderStatusControl({ order }: { order: OrderDetail }) {
  const router = useRouter();
  const admin = useAdminAuth();
  const [selected, setSelected] = useState<OrderStatus | ''>('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isCancelled = order.orderStatus === 'CANCELLED';
  const isSuperAdmin = admin.role === 'SUPER_ADMIN';

  if (isCancelled && !isSuperAdmin) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
        <h3 className="font-semibold text-[var(--heading)]">Order status</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          This order is cancelled — only a Super Admin can modify it further.
        </p>
      </div>
    );
  }

  const availableTargets = isCancelled
    ? ALL_ORDER_STATUSES.filter((s) => s !== 'CANCELLED')
    : ALLOWED_TRANSITIONS[order.orderStatus];

  const paymentWarning = Boolean(
    selected && PAYMENT_REQUIRED_STATUSES.includes(selected) && order.paymentStatus !== 'SUCCESS',
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      await updateOrderStatus(order.id, { status: selected, note: note || undefined }, getClientToken());
      setSelected('');
      setNote('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to change status');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
      <h3 className="font-semibold text-[var(--heading)]">Order status</h3>

      {availableTargets.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--muted)]">
          Terminal status — no further transitions available.
        </p>
      ) : (
        <RoleGate
          permission="orders.write"
          fallback={<p className="mt-2 text-sm text-[var(--muted)]">Read-only for your role.</p>}
        >
          <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value as OrderStatus)}
              className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
            >
              <option value="">Select new status…</option>
              {availableTargets.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
            />
            {paymentWarning ? (
              <p className="text-sm font-semibold text-[var(--danger)]">
                This order isn&apos;t paid yet — SHIPPED/DELIVERED requires a successful payment.
              </p>
            ) : null}
            {error ? <ErrorState title="Could not change status" description={error} /> : null}
            <button
              type="submit"
              disabled={!selected || saving || paymentWarning}
              className="min-h-11 rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Updating…' : 'Update status'}
            </button>
          </form>
        </RoleGate>
      )}
    </div>
  );
}
