'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AddressForm } from '@/components/checkout/AddressForm';
import { CartSummary } from '@/components/cart/CartSummary';
import { Container } from '@/components/common/Container';
import { EmptyState } from '@/components/common/EmptyState';
import { getCart, validateCoupon } from '@/lib/api/cart.api';
import { removeCoupon } from '@/lib/api/coupons.api';
import { createOrder } from '@/lib/api/orders.api';
import { createPayment, verifyPayment } from '@/lib/api/payments.api';
import type { Cart } from '@/lib/types/cart.types';
import type { Order } from '@/lib/types/order.types';
import { getSessionId } from '@/lib/utils/session-id';
import { notifyCartUpdated } from '@/lib/utils/cart-events';
import { getSavedAddress, saveAddress, type SavedAddress } from '@/lib/utils/saved-address';
import { formatPrice } from '@/lib/utils/format-price';
import { track } from '@/lib/analytics/track';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [coupon, setCoupon] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [editingAddress, setEditingAddress] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Deferred to an effect (not a lazy useState initializer) so the SSR pass
    // and first client render both start from `null`, avoiding a hydration
    // mismatch between the server (no localStorage) and the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedAddress(getSavedAddress());
  }, []);

  useEffect(() => {
    let mounted = true;
    getCart(getSessionId())
      .then((nextCart) => {
        if (mounted) setCart(nextCart);
        if (nextCart.items.length > 0) {
          track('CHECKOUT_STARTED', { sessionId: getSessionId() });
        }
      })
      .catch(() => {
        if (mounted) setCart(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleCoupon() {
    setBusy(true);
    setMessage('');
    try {
      await validateCoupon(coupon, getSessionId());
      setCart(await getCart(getSessionId()));
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
      setCart(await getCart(getSessionId()));
      notifyCartUpdated();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to remove coupon');
    } finally {
      setBusy(false);
    }
  }

  async function handlePlaceOrder(address: SavedAddress) {
    setBusy(true);
    setMessage('');
    try {
      const placedOrder = await createOrder({
        sessionId: getSessionId(),
        customerName: address.customerName,
        customerEmail: address.customerEmail,
        customerPhone: address.customerPhone,
        shippingAddress: {
          line1: address.line1,
          line2: address.line2 || undefined,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country,
        },
      });
      saveAddress(address);
      setSavedAddress(address);
      setEditingAddress(false);
      setOrder(placedOrder);
      setStep('payment');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not place order');
    } finally {
      setBusy(false);
    }
  }

  async function handlePay() {
    if (!order) return;
    setBusy(true);
    setMessage('');
    try {
      const payment = await createPayment(order.orderNumber);
      const mockPaymentId = payment.providerPaymentId;
      if (!mockPaymentId) throw new Error('Payment could not be created');
      await verifyPayment(order.orderNumber, mockPaymentId);
      track('ORDER_COMPLETED', {
        sessionId: getSessionId(),
        metadata: { orderNumber: order.orderNumber, grandTotal: order.grandTotal },
      });
      notifyCartUpdated();
      router.push(`/order-success?orderNumber=${encodeURIComponent(order.orderNumber)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setBusy(false);
    }
  }

  const showEmpty = step === 'address' && (!cart || cart.items.length === 0);

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-[#17201d]">Place Order</h1>
          <ol className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
            <li className={step === 'address' ? 'text-[var(--brand)]' : ''}>1. Address</li>
            <span aria-hidden="true">›</span>
            <li className={step === 'payment' ? 'text-[var(--brand)]' : ''}>2. Payment</li>
          </ol>
        </div>

        {showEmpty ? (
          <div className="mt-6">
            <EmptyState title="Your cart is empty" description="Add products before checkout." />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
              {step === 'address' ? (
                savedAddress && !editingAddress ? (
                  <div>
                    <h2 className="text-lg font-semibold text-[#17201d]">Shipping to</h2>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Saved from a previous order on this device.
                    </p>
                    <div className="mt-4 grid gap-1 text-sm text-[#17201d]">
                      <p className="font-semibold">{savedAddress.customerName}</p>
                      <p>{savedAddress.line1}</p>
                      {savedAddress.line2 ? <p>{savedAddress.line2}</p> : null}
                      <p>
                        {savedAddress.city}, {savedAddress.state} {savedAddress.pincode}
                      </p>
                      <p>{savedAddress.country}</p>
                      <p className="mt-2 text-[var(--muted)]">{savedAddress.customerPhone}</p>
                      <p className="text-[var(--muted)]">{savedAddress.customerEmail}</p>
                    </div>
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handlePlaceOrder(savedAddress)}
                        className="min-h-12 flex-1 rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white disabled:opacity-50 sm:flex-none"
                      >
                        {busy ? 'Processing…' : 'Deliver here — Continue'}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setEditingAddress(true)}
                        className="min-h-12 rounded-md border border-[var(--border)] px-5 text-sm font-semibold text-[#17201d] disabled:opacity-50"
                      >
                        Edit address
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg font-semibold text-[#17201d]">
                      {savedAddress ? 'Edit shipping address' : 'Contact and shipping'}
                    </h2>
                    {!savedAddress ? (
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        We will remember this address on this device for next time.
                      </p>
                    ) : null}
                    <div className="mt-4">
                      <AddressForm
                        initialValues={savedAddress}
                        busy={busy}
                        submitLabel="Continue to Payment"
                        onSubmit={handlePlaceOrder}
                        onCancel={savedAddress ? () => setEditingAddress(false) : undefined}
                      />
                    </div>
                  </div>
                )
              ) : order ? (
                <div>
                  <h2 className="text-lg font-semibold text-[#17201d]">Payment</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Order <span className="font-semibold text-[#17201d]">{order.orderNumber}</span> is
                    ready. Complete payment to confirm it.
                  </p>
                  <div className="mt-4 flex justify-between gap-4 rounded-md bg-[var(--soft)] px-4 py-3 text-base font-semibold text-[#17201d]">
                    <span>Amount payable</span>
                    <span>{formatPrice(order.grandTotal)}</span>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handlePay}
                    className="mt-5 min-h-12 w-full rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
                  >
                    {busy ? 'Processing…' : 'Pay Now'}
                  </button>
                </div>
              ) : null}
              {message ? <p className="mt-4 text-sm text-red-700">{message}</p> : null}
            </div>
            {cart ? (
              <CartSummary
                cart={cart}
                coupon={coupon}
                setCoupon={setCoupon}
                onApplyCoupon={handleCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                busy={busy || step === 'payment'}
                checkout
              />
            ) : null}
          </div>
        )}
      </Container>
    </section>
  );
}
