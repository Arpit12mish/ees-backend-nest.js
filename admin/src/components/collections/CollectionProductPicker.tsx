'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts } from '@/lib/api/products.api';
import {
  addProductToCollection,
  bulkAddProductsToCollection,
} from '@/lib/api/collections.api';
import { getClientToken } from '@/lib/auth/token-cookie';
import { ErrorState } from '@/components/common/ErrorState';
import type { AdminProductListItem } from '@/lib/types/product.types';

export function CollectionProductPicker({ collectionId }: { collectionId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AdminProductListItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch() {
    setSearching(true);
    setError('');
    try {
      const data = await getProducts({ search: query, limit: 10 }, getClientToken());
      setResults(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  }

  async function handleAddOne(productId: string) {
    try {
      await addProductToCollection(collectionId, { productId }, getClientToken());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add product');
    }
  }

  async function handleBulkAdd() {
    try {
      const result = await bulkAddProductsToCollection(
        collectionId,
        { productIds: Array.from(selected) },
        getClientToken(),
      );
      setSelected(new Set());
      router.refresh();
      setError(result.skipped > 0 ? `Added ${result.added}, skipped ${result.skipped} (already in collection)` : '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add products');
    }
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
      <h3 className="font-semibold text-[var(--heading)]">Add products</h3>
      <div className="mt-3 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="flex-1 rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="min-h-11 rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--heading)] hover:border-[var(--brand)]"
        >
          Search
        </button>
      </div>

      {error ? <div className="mt-3"><ErrorState title="Notice" description={error} /></div> : null}

      {results.length > 0 ? (
        <div className="mt-3 space-y-2">
          {results.map((product) => (
            <div key={product.id} className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.has(product.id)}
                  onChange={() => toggle(product.id)}
                />
                {product.name} <span className="text-xs text-[var(--muted)]">({product.sku})</span>
              </label>
              <button
                type="button"
                onClick={() => handleAddOne(product.id)}
                className="font-semibold text-[var(--brand)]"
              >
                Add
              </button>
            </div>
          ))}
          {selected.size > 0 ? (
            <button
              type="button"
              onClick={handleBulkAdd}
              className="min-h-11 rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
            >
              Add {selected.size} selected
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
