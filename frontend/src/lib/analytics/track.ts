'use client';

import { API_BASE_URL } from '@/lib/api/api-client';
import { getVisitorId } from '@/lib/utils/visitor-id';

export type AnalyticsEventType =
  | 'PAGE_VIEW'
  | 'PRODUCT_VIEW'
  | 'CATEGORY_VIEW'
  | 'COLLECTION_VIEW'
  | 'SEARCH'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'CHECKOUT_STARTED'
  | 'ORDER_COMPLETED';

export type TrackPayload = {
  sessionId?: string;
  path?: string;
  productId?: string;
  categoryId?: string;
  collectionId?: string;
  searchQuery?: string;
  resultCount?: number;
  metadata?: Record<string, unknown>;
};

// Fire-and-forget: analytics must never break the app or block the UI.
// `keepalive` is the browser-native way to let a request survive page
// unload/redirect, which is exactly what happens right after checkout —
// no client-side queue/batching needed at this store's scale.
export function track(type: AnalyticsEventType, payload: TrackPayload = {}): void {
  if (typeof window === 'undefined') return;
  try {
    fetch(`${API_BASE_URL}/public/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, visitorId: getVisitorId(), ...payload }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // analytics must never break the app
  }
}
