'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProductStatus } from '@/lib/api/products.api';
import { getClientToken } from '@/lib/auth/token-cookie';
import { RoleGate } from '@/components/common/RoleGate';
import { Badge } from '@/components/common/Badge';
import { ErrorState } from '@/components/common/ErrorState';
import type { ProductStatus } from '@/lib/types/product.types';

const STATUSES: ProductStatus[] = ['DRAFT', 'PUBLISHED', 'INACTIVE'];

const TONE: Record<ProductStatus, 'brand' | 'neutral' | 'warning'> = {
  PUBLISHED: 'brand',
  DRAFT: 'warning',
  INACTIVE: 'neutral',
};

export function ProductStatusControl({
  productId,
  currentStatus,
}: {
  productId: string;
  currentStatus: ProductStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ProductStatus>(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleChange(next: ProductStatus) {
    setSaving(true);
    setError('');
    try {
      await updateProductStatus(productId, next, getClientToken());
      setStatus(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to change status');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[var(--heading)]">Publish status</h3>
        <Badge tone={TONE[status]}>{status}</Badge>
      </div>

      <RoleGate
        permission="products.statusChange"
        fallback={
          <p className="mt-3 text-sm text-[var(--muted)]">
            Only an Admin or Super Admin can change publish status.
          </p>
        }
      >
        <div className="mt-3 flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              disabled={saving || s === status}
              onClick={() => handleChange(s)}
              className="min-h-9 rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--heading)] hover:border-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        {error ? <div className="mt-3"><ErrorState title="Could not change status" description={error} /></div> : null}
      </RoleGate>
    </div>
  );
}
