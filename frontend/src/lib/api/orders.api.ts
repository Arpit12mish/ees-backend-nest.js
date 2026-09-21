'use client';

import { apiMutation, API_BASE_URL, unwrapApiResponse } from './api-client';
import type { ApiEnvelope } from '@/lib/types/common.types';
import type { CreateOrderInput, Order } from '@/lib/types/order.types';

export function createOrder(input: CreateOrderInput) {
  return apiMutation<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getOrder(orderNumber: string) {
  const response = await fetch(`${API_BASE_URL}/orders/${orderNumber}`, {
    cache: 'no-store',
  });
  const body = (await response.json()) as ApiEnvelope<Order>;
  if (!response.ok || !body.success) {
    throw new Error(body.message || 'Unable to load order');
  }
  return unwrapApiResponse(body);
}
