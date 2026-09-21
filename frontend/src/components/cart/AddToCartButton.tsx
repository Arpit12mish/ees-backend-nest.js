'use client';

import { useEffect, useState } from 'react';
import { addCartItem, getCartOrNull, updateCartItem, removeCartItem } from '@/lib/api/cart.api';
import { getSessionId } from '@/lib/utils/session-id';
import { notifyCartUpdated, onCartUpdated } from '@/lib/utils/cart-events';
import { track } from '@/lib/analytics/track';

export function AddToCartButton({
  productId,
  disabled,
  className = '',
  variant = 'full',
}: {
  productId: string;
  disabled?: boolean;
  className?: string;
  /** 'full': default full-width labelled button. 'icon': compact circular "+" button (e.g. quick-add on a product card). */
  variant?: 'full' | 'icon';
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [itemId, setItemId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (disabled) return;

    let mounted = true;

    async function sync() {
      const cart = await getCartOrNull(getSessionId());
      const item = cart?.items.find((i) => i.product.id === productId);
      if (mounted) {
        setItemId(item?.id ?? null);
        setQuantity(item?.quantity ?? 0);
      }
    }

    void sync();
    const unsubscribe = onCartUpdated(sync);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [variant, disabled, productId]);

  async function handleAdd() {
    setLoading(true);
    setMessage('');
    try {
      const cart = await addCartItem({
        sessionId: getSessionId(),
        productId,
        quantity: 1,
      });
      const item = cart.items.find((i) => i.product.id === productId);
      setItemId(item?.id ?? null);
      setQuantity(item?.quantity ?? 1);
      setMessage('Added to cart');
      notifyCartUpdated();
      track('ADD_TO_CART', { productId, sessionId: getSessionId() });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to add item');
    } finally {
      setLoading(false);
    }
  }

  async function handleIncrement() {
    if (!itemId) return;
    setLoading(true);
    try {
      const cart = await updateCartItem(itemId, quantity + 1);
      const item = cart.items.find((i) => i.id === itemId);
      setQuantity(item?.quantity ?? quantity + 1);
      notifyCartUpdated();
    } finally {
      setLoading(false);
    }
  }

  async function handleDecrement() {
    if (!itemId) return;
    setLoading(true);
    try {
      if (quantity <= 1) {
        await removeCartItem(itemId);
        setItemId(null);
        setQuantity(0);
        setMessage('');
        track('REMOVE_FROM_CART', { productId, sessionId: getSessionId() });
      } else {
        const cart = await updateCartItem(itemId, quantity - 1);
        const item = cart.items.find((i) => i.id === itemId);
        setQuantity(item?.quantity ?? quantity - 1);
      }
      notifyCartUpdated();
    } finally {
      setLoading(false);
    }
  }

  if (variant === 'icon') {
    if (itemId && quantity > 0) {
      return (
        <div className={className}>
          <div className="flex h-10 items-center gap-0.5 rounded-full bg-white px-1 text-[#111111] shadow-md">
            <button
              type="button"
              disabled={loading}
              onClick={handleDecrement}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              -
            </button>
            <span className="min-w-5 text-center text-sm font-semibold">{quantity}</span>
            <button
              type="button"
              disabled={loading}
              onClick={handleIncrement}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              +
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={className}>
        <button
          type="button"
          disabled={disabled || loading}
          onClick={handleAdd}
          aria-label={disabled ? 'Out of stock' : 'Add to cart'}
          title={disabled ? 'Out of stock' : 'Add to cart'}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#111111] shadow-md transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>
        {message ? <span className="sr-only" role="status">{message}</span> : null}
      </div>
    );
  }

  if (itemId && quantity > 0) {
    return (
      <div className={className}>
        <div className="flex min-h-11 w-full items-stretch overflow-hidden rounded-md bg-[var(--brand)] text-white">
          <button
            type="button"
            disabled={loading}
            onClick={handleDecrement}
            aria-label="Decrease quantity"
            className="flex min-w-11 flex-1 items-center justify-center text-lg font-semibold hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            -
          </button>
          <span className="flex min-w-11 flex-1 items-center justify-center border-x border-white/20 text-sm font-semibold">
            {quantity}
          </span>
          <button
            type="button"
            disabled={loading}
            onClick={handleIncrement}
            aria-label="Increase quantity"
            className="flex min-w-11 flex-1 items-center justify-center text-lg font-semibold hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            +
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={handleAdd}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
      >
        {loading ? 'Adding' : disabled ? 'Out of stock' : 'Add to cart'}
      </button>
      {message ? (
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{message}</p>
      ) : null}
    </div>
  );
}
