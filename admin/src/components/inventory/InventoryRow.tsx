'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateInventory } from '@/lib/api/inventory.api';
import { getClientToken } from '@/lib/auth/token-cookie';
import { RoleGate } from '@/components/common/RoleGate';
import { Badge } from '@/components/common/Badge';
import type { InventoryProduct } from '@/lib/types/inventory.types';

export function InventoryRow({ product }: { product: InventoryProduct }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(product.inventoryQuantity);
  const [threshold, setThreshold] = useState(product.lowStockThreshold);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await updateInventory(product.id, { inventoryQuantity: quantity, lowStockThreshold: threshold }, getClientToken());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-b border-[var(--border)] last:border-0">
      <td className="px-4 py-3">
        <p className="font-medium text-[var(--heading)]">{product.name}</p>
        <p className="text-xs text-[var(--muted)]">{product.sku}</p>
      </td>
      <td className="px-4 py-3">₹{product.price}</td>
      <td className="px-4 py-3">
        <Badge tone={product.stockStatus === 'OUT_OF_STOCK' ? 'danger' : product.stockStatus === 'LOW_STOCK' ? 'warning' : 'brand'}>
          {product.stockStatus.replace('_', ' ')}
        </Badge>
      </td>
      <RoleGate
        permission="inventory.write"
        fallback={
          <>
            <td className="px-4 py-3">{product.inventoryQuantity}</td>
            <td className="px-4 py-3">{product.lowStockThreshold}</td>
            <td className="px-4 py-3" />
          </>
        }
      >
        <td className="px-4 py-3">
          <input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-20 rounded-md border border-[var(--border)] px-2 py-1 text-sm"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            min={0}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-20 rounded-md border border-[var(--border)] px-2 py-1 text-sm"
          />
        </td>
        <td className="px-4 py-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="font-semibold text-[var(--brand)] disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {error ? <p className="text-xs text-[var(--danger)]">{error}</p> : null}
        </td>
      </RoleGate>
    </tr>
  );
}
