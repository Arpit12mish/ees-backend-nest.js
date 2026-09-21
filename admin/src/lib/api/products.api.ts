import { apiFetch, apiMutation } from './api-client';
import type { Paginated } from '@/lib/types/common.types';
import type {
  AdminProductListItem,
  AdminProductQuery,
  CreateProductImageInput,
  ProductDetail,
  ProductImage,
  ProductInput,
  ProductStatus,
  UpdateProductImageInput,
} from '@/lib/types/product.types';

function toSearchParams(query: AdminProductQuery = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

export function getProducts(query?: AdminProductQuery, token?: string | null) {
  const qs = toSearchParams(query);
  return apiFetch<Paginated<AdminProductListItem>>(
    `/admin/products${qs ? `?${qs}` : ''}`,
    { noStore: true, token },
  );
}

export function getProduct(id: string, token?: string | null) {
  return apiFetch<ProductDetail>(`/admin/products/${id}`, { noStore: true, token });
}

export function createProduct(input: ProductInput, token?: string | null) {
  return apiMutation<ProductDetail>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
}

export function updateProduct(
  id: string,
  input: Partial<ProductInput>,
  token?: string | null,
) {
  return apiMutation<ProductDetail>(`/admin/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    token,
  });
}

export function updateProductStatus(
  id: string,
  status: ProductStatus,
  token?: string | null,
) {
  return apiMutation<ProductDetail>(`/admin/products/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    token,
  });
}

export function deleteProduct(id: string, token?: string | null) {
  return apiMutation<null>(`/admin/products/${id}`, { method: 'DELETE', token });
}

export function getProductImages(productId: string, token?: string | null) {
  return apiFetch<ProductImage[]>(`/admin/products/${productId}/images`, {
    noStore: true,
    token,
  });
}

export function addProductImage(
  productId: string,
  input: CreateProductImageInput,
  token?: string | null,
) {
  return apiMutation<ProductImage>(`/admin/products/${productId}/images`, {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
}

export function updateProductImage(
  imageId: string,
  input: UpdateProductImageInput,
  token?: string | null,
) {
  return apiMutation<ProductImage>(`/admin/product-images/${imageId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    token,
  });
}

export function deleteProductImage(imageId: string, token?: string | null) {
  return apiMutation<null>(`/admin/product-images/${imageId}`, {
    method: 'DELETE',
    token,
  });
}

export function setPrimaryProductImage(imageId: string, token?: string | null) {
  return apiMutation<ProductImage>(`/admin/product-images/${imageId}/primary`, {
    method: 'PATCH',
    token,
  });
}
