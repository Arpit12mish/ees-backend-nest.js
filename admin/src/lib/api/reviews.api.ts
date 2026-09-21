import { apiFetch, apiMutation } from './api-client';
import type { Review } from '@/lib/types/review.types';

export function getReviews(token?: string | null) {
  return apiFetch<Review[]>('/admin/reviews', { noStore: true, token });
}

export function setReviewApproval(
  id: string,
  isApproved: boolean,
  token?: string | null,
) {
  return apiMutation<Review>(`/admin/reviews/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isApproved }),
    token,
  });
}

export function deleteReview(id: string, token?: string | null) {
  return apiMutation<null>(`/admin/reviews/${id}`, { method: 'DELETE', token });
}
