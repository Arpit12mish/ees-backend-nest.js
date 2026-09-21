'use client';

import Link from 'next/link';
import type { Cart } from '@/lib/types/cart.types';
import { formatPrice } from '@/lib/utils/format-price';

export function CartSummary({
  cart,
  coupon,
  setCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  busy,
  checkout,
}: {
  cart: Cart;
  coupon: string;
  setCoupon: (value: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon?: () => void;
  busy?: boolean;
  checkout?: boolean;
}) {
  return (
    <aside className="rounded-lg border border-[var(--border)] bg-white p-4">
      <h2 className="text-lg font-semibold text-[#17201d]">Order summary</h2>
      <div className="mt-4 grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-[var(--muted)]">Subtotal</span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[var(--muted)]">Discount</span>
          <span>-{formatPrice(cart.discountAmount)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[var(--muted)]">Shipping</span>
          <span>{cart.shippingAmount === 0 ? 'Free' : formatPrice(cart.shippingAmount)}</span>
        </div>
        <div className="border-t border-[var(--border)] pt-3">
          <div className="flex justify-between gap-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(cart.grandTotal)}</span>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-2">
        <label htmlFor="coupon" className="text-sm font-medium text-[#17201d]">
          Coupon code
        </label>
        <div className="flex gap-2">
          <input
            id="coupon"
            value={coupon}
            onChange={(event) => setCoupon(event.target.value)}
            className="min-h-11 min-w-0 flex-1 rounded-md border border-[var(--border)] px-3 text-sm"
            placeholder="WELCOME10"
          />
          <button
            type="button"
            disabled={busy || !coupon.trim()}
            onClick={onApplyCoupon}
            className="min-h-11 rounded-md bg-[#17201d] px-4 text-sm font-semibold text-white disabled:opacity-40"
          >
            Apply
          </button>
        </div>
        {cart.couponCode ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-[var(--brand)]">Applied: {cart.couponCode}</p>
            {onRemoveCoupon ? (
              <button
                type="button"
                disabled={busy}
                onClick={onRemoveCoupon}
                className="min-h-9 rounded-md px-3 text-xs font-semibold text-red-700 disabled:opacity-40"
              >
                Remove
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      {!checkout ? (
        <Link
          href="/checkout"
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
        >
          Place Order
        </Link>
      ) : null}
    </aside>
  );
}
