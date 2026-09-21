'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { Container } from '@/components/common/Container';
import { EmptyState } from '@/components/common/EmptyState';
import { getCart, updateCartItem, removeCartItem, validateCoupon } from '@/lib/api/cart.api';
import { removeCoupon } from '@/lib/api/coupons.api';
import type { Cart } from '@/lib/types/cart.types';
import { getSessionId } from '@/lib/utils/session-id';
import { notifyCartUpdated, onCartUpdated } from '@/lib/utils/cart-events';
import { track } from '@/lib/analytics/track';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [coupon, setCoupon] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function loadCart() {
    try {
      setCart(await getCart(getSessionId()));
    } catch {
      setCart(null);
    }
  }

  useEffect(() => {
    let mounted = true;
    getCart(getSessionId())
      .then((nextCart) => {
        if (mounted) setCart(nextCart);
      })
      .catch(() => {
        if (mounted) setCart(null);
      });
    const unsubscribe = onCartUpdated(loadCart);

    function onVisible() {
      if (document.visibilityState === 'visible') void loadCart();
    }
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      mounted = false;
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  async function handleUpdate(itemId: string, quantity: number) {
    setBusy(true);
    try {
      setCart(await updateCartItem(itemId, quantity));
      notifyCartUpdated();
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(itemId: string) {
    const productId = cart?.items.find((item) => item.id === itemId)?.product.id;
    setBusy(true);
    try {
      await removeCartItem(itemId);
      await loadCart();
      notifyCartUpdated();
      track('REMOVE_FROM_CART', { productId, sessionId: getSessionId() });
    } finally {
      setBusy(false);
    }
  }

  async function handleCoupon() {
    setBusy(true);
    setMessage('');
    try {
      await validateCoupon(coupon, getSessionId());
      await loadCart();
      notifyCartUpdated();
      setMessage('Coupon applied');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to apply coupon');
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveCoupon() {
    setBusy(true);
    setMessage('');
    try {
      await removeCoupon(getSessionId());
      setCoupon('');
      await loadCart();
      notifyCartUpdated();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to remove coupon');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <h1 className="text-3xl font-semibold text-[#17201d]">Cart</h1>
        {!cart || cart.items.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Your cart is empty"
              description="Browse products and add crystals, stones, or mindful energy products to continue."
            />
            <Link
              href="/products"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white"
            >
              Shop products
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-3">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                  busy={busy}
                />
              ))}
            </div>
            <div>
              <CartSummary
                cart={cart}
                coupon={coupon}
                setCoupon={setCoupon}
                onApplyCoupon={handleCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                busy={busy}
              />
              {message ? (
                <p className="mt-3 text-sm text-[var(--muted)]">{message}</p>
              ) : null}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
