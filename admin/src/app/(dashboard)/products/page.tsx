import Link from 'next/link';
import Image from 'next/image';
import { getProducts } from '@/lib/api/products.api';
import { getCategories } from '@/lib/api/categories.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { Pagination } from '@/components/common/Pagination';
import { RoleGate } from '@/components/common/RoleGate';
import { DeleteButton } from '@/components/common/DeleteButton';
import { resolveImageUrl } from '@/lib/utils/image-url';
import { deleteProductAction } from './actions';
import type { ProductStatus } from '@/lib/types/product.types';

const STATUS_TONE: Record<ProductStatus, 'brand' | 'neutral' | 'warning'> = {
  PUBLISHED: 'brand',
  DRAFT: 'warning',
  INACTIVE: 'neutral',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const search = typeof params.search === 'string' ? params.search : undefined;
  const status = typeof params.status === 'string' ? (params.status as ProductStatus) : undefined;
  const categoryId = typeof params.categoryId === 'string' ? params.categoryId : undefined;
  const sort = typeof params.sort === 'string' ? (params.sort as never) : undefined;
  const page = typeof params.page === 'string' ? Number(params.page) : 1;
  const includeInactive = params.includeInactive === '1';

  const token = await getServerToken();
  const [data, categories] = await Promise.all([
    getProducts({ search, status, categoryId, sort, page, limit: 20, includeInactive }, token),
    getCategories(token),
  ]);

  function buildHref(targetPage: number) {
    const qs = new URLSearchParams();
    if (search) qs.set('search', search);
    if (status) qs.set('status', status);
    if (categoryId) qs.set('categoryId', categoryId);
    if (sort) qs.set('sort', sort);
    if (includeInactive) qs.set('includeInactive', '1');
    qs.set('page', String(targetPage));
    return `/products?${qs.toString()}`;
  }

  return (
    <div>
      <SectionHeading
        title="Products"
        description={`${data.meta.total} ${includeInactive ? '' : 'active '}products`}
        action={
          <RoleGate permission="products.write">
            <Link
              href="/products/new"
              className="min-h-11 inline-flex items-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
            >
              New product
            </Link>
          </RoleGate>
        }
      />

      <form method="get" className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search name, SKU, slug…"
          className="min-w-[200px] flex-1 rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select
          name="categoryId"
          defaultValue={categoryId ?? ''}
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort ?? 'priority'}
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
        >
          <option value="priority">Priority</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price_low_to_high">Price: low to high</option>
          <option value="price_high_to_low">Price: high to low</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-[var(--heading)]">
          <input type="checkbox" name="includeInactive" value="1" defaultChecked={includeInactive} />
          Show deleted / inactive
        </label>
        <button
          type="submit"
          className="min-h-11 rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--heading)] hover:border-[var(--brand)]"
        >
          Filter
        </button>
      </form>

      {data.items.length === 0 ? (
        <EmptyState title="No products found" description="Try adjusting your filters." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((product) => {
                const primaryImage = product.images?.[0];
                return (
                  <tr key={product.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-[var(--soft)]">
                          {primaryImage ? (
                            <Image
                              src={resolveImageUrl(primaryImage.thumbnailUrl || primaryImage.imageUrl)}
                              alt={primaryImage.altText ?? ''}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--heading)]">{product.name}</p>
                          <p className="text-xs text-[var(--muted)]">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{product.category?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      ₹{product.price}{' '}
                      <span className="text-xs text-[var(--muted)] line-through">₹{product.mrp}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[product.status]}>{product.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={product.stockStatus === 'OUT_OF_STOCK' ? 'danger' : 'neutral'}>
                        {product.stockStatus.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{product.priority}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/products/${product.id}`} className="font-semibold text-[var(--brand)]">
                          Edit
                        </Link>
                        <RoleGate permission="products.delete">
                          <DeleteButton
                            id={product.id}
                            action={deleteProductAction}
                            confirmMessage={`Delete "${product.name}"? It will be hidden from the storefront and from this list. You can restore it later from the product's status settings.`}
                          />
                        </RoleGate>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={data.meta.page} totalPages={data.meta.totalPages} buildHref={buildHref} />
    </div>
  );
}
