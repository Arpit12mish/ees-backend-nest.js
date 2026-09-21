import { notFound } from 'next/navigation';
import { getCollection } from '@/lib/api/collections.api';
import { getServerToken } from '@/lib/auth/server-token';
import { SectionHeading } from '@/components/common/SectionHeading';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { RoleGate } from '@/components/common/RoleGate';
import { CollectionForm } from '@/components/collections/CollectionForm';
import { CollectionProductPicker } from '@/components/collections/CollectionProductPicker';
import { removeProductAction, updateSortOrderAction } from '../actions';

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getServerToken();
  const collection = await getCollection(id, token).catch(() => null);
  if (!collection) notFound();

  return (
    <div className="space-y-6">
      <SectionHeading title={collection.name} eyebrow="Collection" />
      <CollectionForm mode="edit" initial={collection} />

      <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
        <h3 className="font-semibold text-[var(--heading)]">Assigned products</h3>
        {collection.collectionProducts.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="No products assigned yet" />
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                  <th className="py-2">Product</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Sort order</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {collection.collectionProducts.map((cp) => (
                  <tr key={cp.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 font-medium text-[var(--heading)]">
                      {cp.product.name} <span className="text-xs text-[var(--muted)]">({cp.product.sku})</span>
                    </td>
                    <td className="py-2">
                      <Badge tone={cp.product.status === 'PUBLISHED' ? 'brand' : 'neutral'}>
                        {cp.product.status}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <RoleGate
                        permission="collections.products.assign"
                        fallback={<span>{cp.sortOrder}</span>}
                      >
                        <form action={updateSortOrderAction} className="flex items-center gap-2">
                          <input type="hidden" name="collectionId" value={collection.id} />
                          <input type="hidden" name="productId" value={cp.productId} />
                          <input
                            type="number"
                            name="sortOrder"
                            defaultValue={cp.sortOrder}
                            min={0}
                            className="w-16 rounded-md border border-[var(--border)] px-2 py-1 text-sm"
                          />
                          <button type="submit" className="font-semibold text-[var(--brand)]">
                            Save
                          </button>
                        </form>
                      </RoleGate>
                    </td>
                    <td className="py-2">
                      <RoleGate permission="collections.products.remove">
                        <form action={removeProductAction}>
                          <input type="hidden" name="collectionId" value={collection.id} />
                          <input type="hidden" name="productId" value={cp.productId} />
                          <button type="submit" className="font-semibold text-[var(--danger)]">
                            Remove
                          </button>
                        </form>
                      </RoleGate>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RoleGate permission="collections.products.assign">
        <CollectionProductPicker collectionId={collection.id} />
      </RoleGate>
    </div>
  );
}
