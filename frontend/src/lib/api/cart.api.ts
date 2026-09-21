'use client';

import { apiMutation, API_BASE_URL } from './api-client';
import type {
  AddToCartInput,
  Cart,
  CouponValidation,
} from '@/lib/types/cart.types';
import { unwrapApiResponse } from './api-client';
import type { ApiEnvelope } from '@/lib/types/common.types';

export function addCartItem(input: AddToCartInput) {
  return apiMutation<Cart>('/cart/items', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getCart(sessionId: string) {
  const response = await fetch(`${API_BASE_URL}/cart/${sessionId}`, {
    cache: 'no-store',
  });
  const body = (await response.json()) as ApiEnvelope<Cart>;
  if (!response.ok || !body.success) {
    throw new Error(body.message || 'Unable to load cart');
  }
  return unwrapApiResponse(body);
}

export async function getCartOrNull(sessionId: string) {
  try {
    return await getCart(sessionId);
  } catch {
    return null;
  }
}

export function updateCartItem(itemId: string, quantity: number) {
  return apiMutation<Cart>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(itemId: string) {
  return apiMutation<Cart>(`/cart/items/${itemId}`, {
    method: 'DELETE',
  });
}

export function clearCart(sessionId: string) {
  return apiMutation<{ message: string }>(`/cart/${sessionId}/clear`, {
    method: 'DELETE',
  });
}

export function validateCoupon(code: string, sessionId: string) {
  return apiMutation<CouponValidation>('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, sessionId }),
  });
}
