import { apiFetch, apiMutation } from './api-client';
import type { Category, CategoryInput } from '@/lib/types/category.types';

export function getCategories(token?: string | null) {
  return apiFetch<Category[]>('/admin/categories', { noStore: true, token });
}

export function getCategory(id: string, token?: string | null) {
  return apiFetch<Category>(`/admin/categories/${id}`, { noStore: true, token });
}

export function createCategory(input: CategoryInput, token?: string | null) {
  return apiMutation<Category>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
}

export function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
  token?: string | null,
) {
  return apiMutation<Category>(`/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    token,
  });
}

export function deleteCategory(id: string, token?: string | null) {
  return apiMutation<null>(`/admin/categories/${id}`, {
    method: 'DELETE',
    token,
  });
}
