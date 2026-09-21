import { apiFetch } from './api-client';
import type {
  Collection,
  CollectionProductsResponse,
} from '@/lib/types/collection.types';

export function getCollections() {
  return apiFetch<Collection[]>('/public/collections', { revalidate: 600 });
}

export function getCollection(slug: string) {
  return apiFetch<Collection>(`/public/collections/${slug}`, {
    revalidate: 600,
  });
}

export function getCollectionProducts(slug: string, page = 1, limit = 20) {
  return apiFetch<CollectionProductsResponse>(
    `/public/collections/${slug}/products?page=${page}&limit=${limit}`,
    { revalidate: 300 },
  );
}
