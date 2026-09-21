'use client';

import { useEffect } from 'react';
import { track, type AnalyticsEventType, type TrackPayload } from '@/lib/analytics/track';

export function TrackView({
  type,
  ...payload
}: { type: AnalyticsEventType } & TrackPayload) {
  const { productId, categoryId, collectionId, searchQuery, resultCount } = payload;

  useEffect(() => {
    track(type, payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, productId, categoryId, collectionId, searchQuery, resultCount]);

  return null;
}
