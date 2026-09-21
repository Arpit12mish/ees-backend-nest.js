import { apiFetch, apiMutation } from './api-client';
import type { Paginated } from '@/lib/types/common.types';
import type { CreateReviewInput, Review } from '@/lib/types/review.types';

export function getProductReviews(slug: string, page = 1) {
  return apiFetch<Paginated<Review>>(
    `/public/products/${slug}/reviews?page=${page}`,
    { revalidate: 300 },
  );
}

export function submitProductReview(slug: string, input: CreateReviewInput) {
  return apiMutation<Review>(`/public/products/${slug}/reviews`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
