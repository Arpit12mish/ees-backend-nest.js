import { apiFetch, apiMutation } from './api-client';
import type { Paginated } from '@/lib/types/common.types';
import type {
  AdminOrderListItem,
  AdminOrderQuery,
  CancelOrderInput,
  OrderDetail,
  UpdateOrderStatusInput,
} from '@/lib/types/order.types';

function toSearchParams(query: AdminOrderQuery = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

export function getOrders(query?: AdminOrderQuery, token?: string | null) {
  const qs = toSearchParams(query);
  return apiFetch<Paginated<AdminOrderListItem>>(`/admin/orders${qs ? `?${qs}` : ''}`, {
    noStore: true,
    token,
  });
}

export function getOrder(id: string, token?: string | null) {
  return apiFetch<OrderDetail>(`/admin/orders/${id}`, { noStore: true, token });
}

export function getOrderByNumber(orderNumber: string, token?: string | null) {
  return apiFetch<OrderDetail>(`/admin/orders/order-number/${orderNumber}`, {
    noStore: true,
    token,
  });
}

export function updateOrderStatus(
  id: string,
  input: UpdateOrderStatusInput,
  token?: string | null,
) {
  return apiMutation<OrderDetail>(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    token,
  });
}

export function cancelOrder(id: string, input: CancelOrderInput, token?: string | null) {
  return apiMutation<OrderDetail>(`/admin/orders/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    token,
  });
}
