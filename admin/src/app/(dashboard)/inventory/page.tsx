import Link from 'next/link';
import { getInventory, getLowStockInventory } from '@/lib/api/inventory.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { EmptyState } from '@/components/common/EmptyState';
import { InventoryRow } from '@/components/inventory/InventoryRow';

export default async function InventoryPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const lowStockOnly = params.lowStockOnly === '1';

  const token = await getServerToken();
  const products = lowStockOnly ? await getLowStockInventory(token) : await getInventory(token);

  return (
    <div>
      <SectionHeading
        title="Inventory"
        description={`${products.length} products`}
        action={
          <Link
            href={lowStockOnly ? '/inventory' : '/inventory?lowStockOnly=1'}
            className="min-h-11 inline-flex items-center rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--heading)] hover:border-[var(--brand)]"
          >
            {lowStockOnly ? 'Show all' : 'Show low-stock only'}
          </Link>
        }
      />

      {products.length === 0 ? (
        <EmptyState title="Nothing to show" description="No products match this view." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Low-stock threshold</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <InventoryRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
