'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCoupon, updateCoupon } from '@/lib/api/coupons.api';
import { getClientToken } from '@/lib/auth/token-cookie';
import { ErrorState } from '@/components/common/ErrorState';
import type { Coupon, CouponInput, CouponType } from '@/lib/types/coupon.types';

function toDateInputValue(value?: string | null) {
  if (!value) return '';
  return value.slice(0, 10);
}

export function CouponForm({
  mode,
  initial,
}: {
  mode: 'create' | 'edit';
  initial?: Coupon;
}) {
  const router = useRouter();
  const [form, setForm] = useState<CouponInput>({
    code: initial?.code ?? '',
    type: initial?.type ?? 'PERCENTAGE',
    value: initial?.value ?? 0,
    minOrderAmount: initial?.minOrderAmount ?? undefined,
    maxDiscountAmount: initial?.maxDiscountAmount ?? undefined,
    startDate: toDateInputValue(initial?.startDate),
    endDate: toDateInputValue(initial?.endDate),
    usageLimit: initial?.usageLimit ?? undefined,
    isActive: initial?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const dateRangeInvalid =
    form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (dateRangeInvalid) return;
    setSaving(true);
    setError('');
    const input: CouponInput = {
      ...form,
      code: form.code.trim().toUpperCase(),
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };
    try {
      if (mode === 'create') {
        const created = await createCoupon(input, getClientToken());
        router.push(`/coupons/${created.id}`);
      } else if (initial) {
        await updateCoupon(initial.id, input, getClientToken());
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save coupon');
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none';
  const labelClass = 'block text-sm font-medium text-[var(--heading)]';

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Code</label>
          <input
            required
            maxLength={50}
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}
            className={inputClass}
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed amount</option>
            <option value="FREE_SHIPPING">Free shipping</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Value {form.type === 'PERCENTAGE' ? '(%)' : form.type === 'FIXED_AMOUNT' ? '(₹)' : '(ignored for free shipping)'}
        </label>
        <input
          type="number"
          min={0}
          step="0.01"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Min order amount</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.minOrderAmount ?? ''}
            onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value ? Number(e.target.value) : undefined })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Max discount amount</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.maxDiscountAmount ?? ''}
            onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Start date</label>
          <input
            type="date"
            value={form.startDate ?? ''}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>End date</label>
          <input
            type="date"
            value={form.endDate ?? ''}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      {dateRangeInvalid ? (
        <p className="text-sm font-semibold text-[var(--danger)]">End date must be after start date.</p>
      ) : null}

      <div className="flex items-center gap-6">
        <div>
          <label className={labelClass}>Usage limit</label>
          <input
            type="number"
            min={1}
            value={form.usageLimit ?? ''}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : undefined })}
            className="mt-1 w-28 rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
          />
        </div>
        <label className="flex items-center gap-2 pt-6 text-sm font-medium text-[var(--heading)]">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>
      </div>

      {initial ? (
        <p className="text-sm text-[var(--muted)]">Used {initial.usedCount} times so far.</p>
      ) : null}

      {error ? <ErrorState title="Could not save" description={error} /> : null}

      <button
        type="submit"
        disabled={saving || Boolean(dateRangeInvalid)}
        className="min-h-11 rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Saving…' : mode === 'create' ? 'Create coupon' : 'Save changes'}
      </button>
    </form>
  );
}
