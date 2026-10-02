'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClientFilter } from '@/lib/hooks/useClientFilter';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { RoleGate } from '@/components/common/RoleGate';
import { DeleteButton } from '@/components/common/DeleteButton';
import type { Coupon } from '@/lib/types/coupon.types';

export function CouponsTable({
  coupons,
  deleteAction,
}: {
  coupons: Coupon[];
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  const [showInactive, setShowInactive] = useState(false);
  const visible = showInactive ? coupons : coupons.filter((c) => c.isActive);
  const { query, setQuery, filtered } = useClientFilter(visible, (c) => [c.code]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search coupon codes…" />
        <label className="flex items-center gap-2 text-sm text-[var(--heading)]">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Show deleted / inactive
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={coupons.length === 0 ? 'No coupons yet' : 'No matches'}
          description={
            coupons.length === 0
              ? undefined
              : visible.length === 0
                ? 'All coupons are inactive — check "Show deleted / inactive".'
                : 'Try a different search term.'
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((coupon) => (
                <tr key={coupon.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 font-medium text-[var(--heading)]">{coupon.code}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{coupon.type.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : coupon.type === 'FIXED_AMOUNT' ? `₹${coupon.value}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {coupon.usedCount}
                    {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={coupon.isActive ? 'brand' : 'neutral'}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/coupons/${coupon.id}`} className="font-semibold text-[var(--brand)]">
                        Edit
                      </Link>
                      <RoleGate permission="coupons.write">
                        <DeleteButton
                          id={coupon.id}
                          action={deleteAction}
                          confirmMessage={`Delete coupon "${coupon.code}"? It will be deactivated and can no longer be applied at checkout.`}
                        />
                      </RoleGate>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
