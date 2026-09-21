import Link from 'next/link';
import { getOrders } from '@/lib/api/orders.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { Pagination } from '@/components/common/Pagination';
import type { OrderStatus, PaymentStatus } from '@/lib/types/order.types';

const ORDER_STATUS_TONE: Record<OrderStatus, 'brand' | 'neutral' | 'danger' | 'warning'> = {
  PENDING_PAYMENT: 'warning',
  CONFIRMED: 'brand',
  PROCESSING: 'brand',
  SHIPPED: 'brand',
  DELIVERED: 'brand',
  CANCELLED: 'neutral',
  FAILED: 'danger',
};
const PAYMENT_STATUS_TONE: Record<PaymentStatus, 'brand' | 'neutral' | 'danger' | 'warning'> = {
  PENDING: 'warning',
  SUCCESS: 'brand',
  FAILED: 'danger',
  REFUNDED: 'neutral',
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const search = typeof params.search === 'string' ? params.search : undefined;
  const orderStatus = typeof params.orderStatus === 'string' ? (params.orderStatus as OrderStatus) : undefined;
  const paymentStatus = typeof params.paymentStatus === 'string' ? (params.paymentStatus as PaymentStatus) : undefined;
  const fromDate = typeof params.fromDate === 'string' ? params.fromDate : undefined;
  const toDate = typeof params.toDate === 'string' ? params.toDate : undefined;
  const page = typeof params.page === 'string' ? Number(params.page) : 1;

  const token = await getServerToken();
  const data = await getOrders({ search, orderStatus, paymentStatus, fromDate, toDate, page, limit: 20 }, token);

  function buildHref(targetPage: number) {
    const qs = new URLSearchParams();
    if (search) qs.set('search', search);
    if (orderStatus) qs.set('orderStatus', orderStatus);
    if (paymentStatus) qs.set('paymentStatus', paymentStatus);
    if (fromDate) qs.set('fromDate', fromDate);
    if (toDate) qs.set('toDate', toDate);
    qs.set('page', String(targetPage));
    return `/orders?${qs.toString()}`;
  }

  return (
    <div>
      <SectionHeading title="Orders" description={`${data.meta.total} orders`} />

      <form method="get" className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Order #, email, name…"
          className="min-w-[200px] flex-1 rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
        <select name="orderStatus" defaultValue={orderStatus ?? ''} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm">
          <option value="">All order statuses</option>
          <option value="PENDING_PAYMENT">Pending payment</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="FAILED">Failed</option>
        </select>
        <select name="paymentStatus" defaultValue={paymentStatus ?? ''} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm">
          <option value="">All payment statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <input type="date" name="fromDate" defaultValue={fromDate} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm" />
        <input type="date" name="toDate" defaultValue={toDate} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm" />
        <button type="submit" className="min-h-11 rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--heading)] hover:border-[var(--brand)]">
          Filter
        </button>
      </form>

      {data.items.length === 0 ? (
        <EmptyState title="No orders found" description="Try adjusting your filters." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Placed</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((order) => (
                <tr key={order.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 font-medium text-[var(--heading)]">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p>{order.customerName}</p>
                    <p className="text-xs text-[var(--muted)]">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3">₹{order.grandTotal}</td>
                  <td className="px-4 py-3">
                    <Badge tone={PAYMENT_STATUS_TONE[order.paymentStatus]}>{order.paymentStatus}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={ORDER_STATUS_TONE[order.orderStatus]}>{order.orderStatus.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/orders/${order.id}`} className="font-semibold text-[var(--brand)]">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={data.meta.page} totalPages={data.meta.totalPages} buildHref={buildHref} />
    </div>
  );
}
