'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics/track';

// Mounted once in the root layout. Tracks path only (not the query string) —
// reading useSearchParams() here would force this component under a
// Suspense boundary for no real benefit to page-view counting.
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track('PAGE_VIEW', { path: pathname });
  }, [pathname]);

  return null;
}
