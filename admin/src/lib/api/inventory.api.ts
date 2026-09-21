import { apiFetch, apiMutation } from './api-client';
import type { InventoryProduct, UpdateInventoryInput } from '@/lib/types/inventory.types';

export function getInventory(token?: string | null) {
  return apiFetch<InventoryProduct[]>('/admin/inventory', { noStore: true, token });
}

export function getLowStockInventory(token?: string | null) {
  return apiFetch<InventoryProduct[]>('/admin/inventory/low-stock', { noStore: true, token });
}

export function updateInventory(
  productId: string,
  input: UpdateInventoryInput,
  token?: string | null,
) {
  return apiMutation<InventoryProduct>(`/admin/inventory/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    token,
  });
}
