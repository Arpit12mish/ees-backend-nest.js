import { notFound } from 'next/navigation';
import { getOrder } from '@/lib/api/orders.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Badge } from '@/components/common/Badge';
import { OrderStatusControl } from '@/components/orders/OrderStatusControl';

function AddressBlock({ address }: { address: Record<string, unknown> }) {
  const known = ['line1', 'line2', 'city', 'state', 'pincode', 'country'];
  const hasKnownShape = known.some((k) => k in address);

  if (!hasKnownShape) {
    return <pre className="whitespace-pre-wrap text-xs text-[var(--muted)]">{JSON.stringify(address, null, 2)}</pre>;
  }

  return (
    <div className="text-sm text-[var(--muted)]">
      {known.map((key) =>
        address[key] ? <p key={key}>{String(address[key])}</p> : null,
      )}
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  const order = await getOrder(id, token).catch(() => null);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <SectionHeading
        title={order.orderNumber}
        eyebrow="Order"
        description={`Placed ${new Date(order.createdAt).toLocaleString()}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
          <h3 className="font-semibold text-[var(--heading)]">Customer</h3>
          <p className="mt-2 text-sm">{order.customerName}</p>
          <p className="text-sm text-[var(--muted)]">{order.customerEmail}</p>
          <p className="text-sm text-[var(--muted)]">{order.customerPhone}</p>
          <h4 className="mt-4 text-sm font-semibold text-[var(--heading)]">Shipping address</h4>
          <div className="mt-1">
            <AddressBlock address={order.shippingAddress} />
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
          <h3 className="font-semibold text-[var(--heading)]">Totals</h3>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--muted)]">Subtotal</dt><dd>₹{order.subtotal}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--muted)]">Discount</dt><dd>₹{order.discountAmount}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--muted)]">Shipping</dt><dd>₹{order.shippingAmount}</dd></div>
            <div className="flex justify-between font-semibold text-[var(--heading)]"><dt>Grand total</dt><dd>₹{order.grandTotal}</dd></div>
            {order.couponCode ? (
              <div className="flex justify-between"><dt className="text-[var(--muted)]">Coupon</dt><dd>{order.couponCode}</dd></div>
            ) : null}
          </dl>
          <div className="mt-3 flex gap-2">
            <Badge tone={order.paymentStatus === 'SUCCESS' ? 'brand' : 'warning'}>{order.paymentStatus}</Badge>
            <Badge tone="neutral">{order.orderStatus.replace('_', ' ')}</Badge>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
        <h3 className="font-semibold text-[var(--heading)]">Items</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="py-2">Product</th>
                <th className="py-2">SKU</th>
                <th className="py-2">Price</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 font-medium text-[var(--heading)]">{item.productName}</td>
                  <td className="py-2 text-[var(--muted)]">{item.sku}</td>
                  <td className="py-2">₹{item.priceAtPurchase}</td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2">₹{item.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
        <h3 className="font-semibold text-[var(--heading)]">Payments</h3>
        {order.payments.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">No payment records yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                  <th className="py-2">Provider</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {order.payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2">{payment.provider}</td>
                    <td className="py-2">₹{payment.amount}</td>
                    <td className="py-2">
                      <Badge tone={payment.status === 'SUCCESS' ? 'brand' : 'warning'}>{payment.status}</Badge>
                    </td>
                    <td className="py-2 text-[var(--muted)]">{new Date(payment.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderStatusControl order={order} />

      <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
        <h3 className="font-semibold text-[var(--heading)]">Status history</h3>
        {order.statusHistory.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">No status changes yet.</p>
        ) : (
          <ul className="mt-3 space-y-3 text-sm">
            {order.statusHistory.map((entry) => (
              <li key={entry.id} className="border-b border-[var(--border)] pb-3 last:border-0">
                <p>
                  <span className="font-medium text-[var(--heading)]">{entry.oldStatus}</span>
                  {' → '}
                  <span className="font-medium text-[var(--heading)]">{entry.newStatus}</span>
                </p>
                {entry.note ? <p className="text-[var(--muted)]">{entry.note}</p> : null}
                <p className="text-xs text-[var(--muted)]">
                  {entry.changedByAdmin?.name ?? 'System'} · {new Date(entry.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
