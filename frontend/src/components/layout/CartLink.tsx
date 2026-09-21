'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCartOrNull } from '@/lib/api/cart.api';
import { getSessionId } from '@/lib/utils/session-id';
import { onCartUpdated } from '@/lib/utils/cart-events';

export function CartLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function refresh() {
      const cart = await getCartOrNull(getSessionId());
      if (mounted) setCount(cart?.itemCount ?? 0);
    }

    void refresh();
    const unsubscribe = onCartUpdated(refresh);

    // Defensive fallback: pick up any change missed while this tab was
    // backgrounded (e.g. a cross-tab message that arrived while suspended).
    function onVisible() {
      if (document.visibilityState === 'visible') void refresh();
    }
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      mounted = false;
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-3 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] sm:px-4"
    >
      <span>Cart</span>
      {count > 0 ? (
        <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs text-[var(--brand)]">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
