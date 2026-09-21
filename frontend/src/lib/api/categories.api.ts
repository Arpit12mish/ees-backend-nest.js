import { apiFetch } from './api-client';
import type { Paginated } from '@/lib/types/common.types';
import type { Category } from '@/lib/types/category.types';

export function getCategories(page = 1, limit = 50) {
  return apiFetch<Paginated<Category>>(
    `/public/categories?page=${page}&limit=${limit}`,
    { revalidate: 600 },
  );
}

export function getCategory(slug: string) {
  return apiFetch<Category>(`/public/categories/${slug}`, {
    revalidate: 600,
  });
}
