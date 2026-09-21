'use client';

import { apiMutation } from './api-client';

export { validateCoupon } from './cart.api';

export function removeCoupon(sessionId: string) {
  return apiMutation<{ message: string }>(`/coupons/${sessionId}`, {
    method: 'DELETE',
  });
}
