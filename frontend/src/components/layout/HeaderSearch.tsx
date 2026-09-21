'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { searchProducts } from '@/lib/api/products.api';
import { ProductPrice } from '@/components/products/ProductPrice';
import { SafeProductImage } from '@/components/products/SafeProductImage';
import type { ProductCardProduct } from '@/lib/types/product.types';

function previewImage(product: ProductCardProduct) {
  const image = product.primaryImage ?? product.images?.[0];
  return image?.thumbnailUrl ?? image?.cardUrl ?? image?.imageUrl ?? null;
}

export function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductCardProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const timer = setTimeout(() => {
      setLoading(true);
      searchProducts(trimmed, 1, 5)
        .then((data) => setResults(data.items))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    router.push(`/products?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Search products"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border)] text-[#34413d] hover:border-[var(--brand)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-5 w-5"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(90vw,360px)] rounded-lg border border-[var(--border)] bg-white p-3 shadow-lg">
          <form onSubmit={handleSubmit}>
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search crystals, stones, bracelets…"
              className="min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm"
            />
          </form>

          {query.trim().length >= 2 ? (
            <div className="mt-3">
              {loading ? (
                <p className="py-4 text-center text-sm text-[var(--muted)]">Searching…</p>
              ) : results.length === 0 ? (
                <p className="py-4 text-center text-sm text-[var(--muted)]">
                  No products found.
                </p>
              ) : (
                <ul className="grid gap-2">
                  {results.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-md p-2 hover:bg-[var(--soft)]"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[var(--soft)]">
                          <SafeProductImage
                            src={previewImage(product)}
                            alt={product.name}
                            sizes="48px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#17201d]">
                            {product.name}
                          </p>
                          <ProductPrice
                            price={product.price}
                            mrp={product.mrp}
                            discountPercent={product.discountPercent}
                            currency={product.currency}
                          />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={`/products?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-md py-2 text-center text-sm font-semibold text-[var(--brand)] hover:bg-[var(--soft)]"
              >
                View all results for &ldquo;{query.trim()}&rdquo;
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
