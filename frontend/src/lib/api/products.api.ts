import { apiFetch } from './api-client';
import type { Paginated } from '@/lib/types/common.types';
import type {
  ProductCardProduct,
  ProductDetail,
  ProductQuery,
} from '@/lib/types/product.types';

function toSearchParams(query: ProductQuery = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

export function getProducts(query?: ProductQuery) {
  const qs = toSearchParams(query);
  return apiFetch<Paginated<ProductCardProduct>>(
    `/public/products${qs ? `?${qs}` : ''}`,
    { revalidate: 300, tags: ['products'] },
  );
}

export function getFeaturedProducts() {
  return apiFetch<ProductCardProduct[]>('/public/products/featured', {
    revalidate: 300,
    tags: ['products'],
  });
}

export function searchProducts(q: string, page = 1, limit = 20) {
  const params = new URLSearchParams({ q, page: String(page), limit: String(limit) });
  return apiFetch<Paginated<ProductCardProduct>>(
    `/public/products/search?${params.toString()}`,
    { revalidate: 300, tags: ['products'] },
  );
}

export function getProductsByCategory(categorySlug: string, query?: ProductQuery) {
  const qs = toSearchParams(query);
  return apiFetch<Paginated<ProductCardProduct>>(
    `/public/products/category/${categorySlug}${qs ? `?${qs}` : ''}`,
    { revalidate: 300, tags: ['products'] },
  );
}

export function getProduct(slug: string) {
  return apiFetch<ProductDetail>(`/public/products/${slug}`, {
    revalidate: 600,
    tags: ['products', `product:${slug}`],
  });
}
