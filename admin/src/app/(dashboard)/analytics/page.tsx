import Link from 'next/link';
import {
  getAnalyticsOverview,
  getProductAnalytics,
  getSearchAnalytics,
  getCartAbandonment,
} from '@/lib/api/analytics.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { EmptyState } from '@/components/common/EmptyState';

const PERIODS = [7, 30, 90];

const EVENT_LABELS: Record<string, string> = {
  PAGE_VIEW: 'Page views',
  PRODUCT_VIEW: 'Product views',
  CATEGORY_VIEW: 'Category views',
  COLLECTION_VIEW: 'Collection views',
  SEARCH: 'Searches',
  ADD_TO_CART: 'Add to cart',
  REMOVE_FROM_CART: 'Remove from cart',
  CHECKOUT_STARTED: 'Checkouts started',
  ORDER_COMPLETED: 'Orders completed',
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-5">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-[var(--heading)]">{value}</p>
    </div>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const parsedDays = typeof params.days === 'string' ? Number(params.days) : 30;
  const days = PERIODS.includes(parsedDays) ? parsedDays : 30;

  const token = await getServerToken();
  const [overview, products, searches, abandonment] = await Promise.all([
    getAnalyticsOverview(token, days),
    getProductAnalytics(token, days, 10),
    getSearchAnalytics(token, days, 10),
    getCartAbandonment(token, 24),
  ]);

  return (
    <div>
      <SectionHeading
        title="Analytics"
        description={`Store activity over the last ${days} days.`}
        action={
          <div className="flex gap-2">
            {PERIODS.map((period) => (
              <Link
                key={period}
                href={`/analytics?days=${period}`}
                className={`min-h-11 inline-flex items-center rounded-md border px-4 text-sm font-semibold ${
                  period === days
                    ? 'border-[var(--brand)] bg-[var(--brand)] text-white'
                    : 'border-[var(--border)] text-[var(--heading)] hover:border-[var(--brand)]'
                }`}
              >
                {period}d
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Unique visitors" value={overview.uniqueVisitors} />
        <StatCard label="Conversion rate" value={`${overview.conversionRate}%`} />
        <StatCard label="Orders completed" value={overview.orders.count} />
        <StatCard label="Revenue" value={`₹${overview.orders.revenue.toLocaleString('en-IN')}`} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-[var(--heading)]">Event breakdown</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(overview.eventCounts).map(([type, count]) => (
            <div key={type} className="rounded-lg border border-[var(--border)] bg-white p-4">
              <p className="text-xs text-[var(--muted)]">{EVENT_LABELS[type] ?? type}</p>
              <p className="mt-1 text-xl font-semibold text-[var(--heading)]">{count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-[var(--heading)]">Product performance</h2>
        {products.products.length === 0 ? (
          <EmptyState title="No product activity yet" description="No tracked views or purchases in this period." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">Added to cart</th>
                  <th className="px-4 py-3">Purchased (units)</th>
                </tr>
              </thead>
              <tbody>
                {products.products.map((row) => (
                  <tr key={row.productId} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 font-medium text-[var(--heading)]">
                      {row.product?.name ?? row.productId}
                    </td>
                    <td className="px-4 py-3">{row.views}</td>
                    <td className="px-4 py-3">{row.addToCart}</td>
                    <td className="px-4 py-3">{row.purchased}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-[var(--heading)]">Top searches</h2>
          {searches.topSearches.length === 0 ? (
            <EmptyState title="No searches yet" description="No search queries in this period." />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                    <th className="px-4 py-3">Query</th>
                    <th className="px-4 py-3">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {searches.topSearches.map((row) => (
                    <tr key={row.query} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-4 py-3">{row.query}</td>
                      <td className="px-4 py-3">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold text-[var(--heading)]">Zero-result searches</h2>
          {searches.zeroResultSearches.length === 0 ? (
            <EmptyState title="No gaps found" description="Every search in this period returned results." />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                    <th className="px-4 py-3">Query</th>
                    <th className="px-4 py-3">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {searches.zeroResultSearches.map((row) => (
                    <tr key={row.query} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-4 py-3">{row.query}</td>
                      <td className="px-4 py-3">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-[var(--heading)]">
          Abandoned carts (24h+)
        </h2>
        <p className="mb-3 text-sm text-[var(--muted)]">
          {abandonment.totalAbandonedCarts} carts &middot; ₹
          {abandonment.totalAbandonedValue.toLocaleString('en-IN')} at stake
        </p>
        {abandonment.carts.length === 0 ? (
          <EmptyState title="No abandoned carts" description="No stale carts older than 24 hours." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Last activity</th>
                </tr>
              </thead>
              <tbody>
                {abandonment.carts.map((cart) => (
                  <tr key={cart.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{cart.sessionId}</td>
                    <td className="px-4 py-3">{cart.userEmail ?? '—'}</td>
                    <td className="px-4 py-3">
                      {cart.items.map((item) => item.product?.name ?? item.id).join(', ')}
                    </td>
                    <td className="px-4 py-3">₹{cart.cartValue.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      {new Date(cart.updatedAt).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
