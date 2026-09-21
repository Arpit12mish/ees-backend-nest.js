import Link from 'next/link';
import { getServerToken } from '@/lib/auth/server-token';
import { getMe } from '@/lib/api/auth.api';
import { getLowStockInventory } from '@/lib/api/inventory.api';
import { getOrders } from '@/lib/api/orders.api';
import { getContactLeads } from '@/lib/api/contactLeads.api';
import { getAnalyticsOverview } from '@/lib/api/analytics.api';
import { SectionHeading } from '@/components/common/SectionHeading';

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-[var(--border)] bg-white p-5 hover:border-[var(--brand)]"
    >
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-[var(--heading)]">{value}</p>
    </Link>
  );
}

export default async function DashboardHomePage() {
  const token = await getServerToken();
  const [admin, lowStock, pendingOrders, leads, overview] = await Promise.all([
    getMe(token),
    getLowStockInventory(token),
    getOrders({ orderStatus: 'PENDING_PAYMENT', limit: 1 }, token),
    getContactLeads(token),
    getAnalyticsOverview(token, 30),
  ]);
  const newLeads = leads.filter((l) => l.status === 'NEW').length;

  return (
    <div>
      <SectionHeading
        title={`Welcome, ${admin.name}`}
        description={`Signed in as ${admin.role}.`}
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Low-stock products" value={lowStock.length} href="/inventory?lowStockOnly=1" />
        <StatCard label="Orders pending payment" value={pendingOrders.meta.total} href="/orders?orderStatus=PENDING_PAYMENT" />
        <StatCard label="New contact leads" value={newLeads} href="/contact-leads" />
        <StatCard label="Unique visitors (30d)" value={overview.uniqueVisitors} href="/analytics" />
      </div>
    </div>
  );
}
