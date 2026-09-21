import { apiFetch } from './api-client';
import type {
  AnalyticsOverview,
  ProductAnalytics,
  SearchAnalytics,
  CartAbandonment,
} from '@/lib/types/analytics.types';

export function getAnalyticsOverview(token?: string | null, days = 30) {
  return apiFetch<AnalyticsOverview>(`/admin/analytics/overview?days=${days}`, {
    noStore: true,
    token,
  });
}

export function getProductAnalytics(token?: string | null, days = 30, limit = 20) {
  return apiFetch<ProductAnalytics>(
    `/admin/analytics/products?days=${days}&limit=${limit}`,
    { noStore: true, token },
  );
}

export function getSearchAnalytics(token?: string | null, days = 30, limit = 20) {
  return apiFetch<SearchAnalytics>(
    `/admin/analytics/searches?days=${days}&limit=${limit}`,
    { noStore: true, token },
  );
}

export function getCartAbandonment(token?: string | null, hours = 24) {
  return apiFetch<CartAbandonment>(
    `/admin/analytics/cart-abandonment?hours=${hours}`,
    { noStore: true, token },
  );
}
