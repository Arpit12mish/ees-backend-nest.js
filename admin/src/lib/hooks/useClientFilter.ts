'use client';

import { useMemo, useState } from 'react';

// For the admin endpoints that return a plain array with no server-side
// pagination (categories, collections, coupons, contact leads): filters the
// array in-memory against a search query. Must be called from inside a
// Client Component that already holds the data as a plain prop — a
// render-prop/children-as-function pattern doesn't work here since a Server
// Component parent can't pass a function across the RSC boundary.
export function useClientFilter<T>(items: T[], filterKeys: (item: T) => string[]) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      filterKeys(item).some((key) => key.toLowerCase().includes(q)),
    );
  }, [items, query, filterKeys]);

  return { query, setQuery, filtered };
}
