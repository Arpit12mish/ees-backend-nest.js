import { apiFetch, apiMutation } from './api-client';
import type {
  AddCollectionProductInput,
  BulkAddCollectionProductsInput,
  BulkAddResult,
  Collection,
  CollectionDetail,
  CollectionInput,
  CollectionProductSummary,
} from '@/lib/types/collection.types';

export function getCollections(token?: string | null) {
  return apiFetch<Collection[]>('/admin/collections', { noStore: true, token });
}

export function getCollection(id: string, token?: string | null) {
  return apiFetch<CollectionDetail>(`/admin/collections/${id}`, { noStore: true, token });
}

export function createCollection(input: CollectionInput, token?: string | null) {
  return apiMutation<Collection>('/admin/collections', {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
}

export function updateCollection(
  id: string,
  input: Partial<CollectionInput>,
  token?: string | null,
) {
  return apiMutation<Collection>(`/admin/collections/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    token,
  });
}

export function deleteCollection(id: string, token?: string | null) {
  return apiMutation<null>(`/admin/collections/${id}`, { method: 'DELETE', token });
}

export function addProductToCollection(
  id: string,
  input: AddCollectionProductInput,
  token?: string | null,
) {
  return apiMutation<CollectionProductSummary>(`/admin/collections/${id}/products`, {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
}

export function bulkAddProductsToCollection(
  id: string,
  input: BulkAddCollectionProductsInput,
  token?: string | null,
) {
  return apiMutation<BulkAddResult>(`/admin/collections/${id}/products/bulk`, {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
}

export function removeProductFromCollection(
  id: string,
  productId: string,
  token?: string | null,
) {
  return apiMutation<null>(`/admin/collections/${id}/products/${productId}`, {
    method: 'DELETE',
    token,
  });
}

export function updateCollectionProductSortOrder(
  id: string,
  productId: string,
  sortOrder: number,
  token?: string | null,
) {
  return apiMutation<CollectionProductSummary>(
    `/admin/collections/${id}/products/${productId}/sort-order`,
    { method: 'PATCH', body: JSON.stringify({ sortOrder }), token },
  );
}
