'use client';

import { apiMutation } from './api-client';
import type {
  PaymentCreateResponse,
  PaymentVerifyResponse,
} from '@/lib/types/order.types';

export function createPayment(orderNumber: string) {
  return apiMutation<PaymentCreateResponse>('/payments/create', {
    method: 'POST',
    body: JSON.stringify({ orderNumber }),
  });
}

export function verifyPayment(orderNumber: string, mockPaymentId: string) {
  return apiMutation<PaymentVerifyResponse>('/payments/verify', {
    method: 'POST',
    body: JSON.stringify({ orderNumber, mockPaymentId }),
  });
}
