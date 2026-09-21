import { apiFetch, apiMutation } from './api-client';
import type { Coupon, CouponInput } from '@/lib/types/coupon.types';

export function getCoupons(token?: string | null) {
  return apiFetch<Coupon[]>('/admin/coupons', { noStore: true, token });
}

export function getCoupon(id: string, token?: string | null) {
  return apiFetch<Coupon>(`/admin/coupons/${id}`, { noStore: true, token });
}

export function createCoupon(input: CouponInput, token?: string | null) {
  return apiMutation<Coupon>('/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
}

export function updateCoupon(id: string, input: Partial<CouponInput>, token?: string | null) {
  return apiMutation<Coupon>(`/admin/coupons/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    token,
  });
}

export function deleteCoupon(id: string, token?: string | null) {
  return apiMutation<null>(`/admin/coupons/${id}`, { method: 'DELETE', token });
}
