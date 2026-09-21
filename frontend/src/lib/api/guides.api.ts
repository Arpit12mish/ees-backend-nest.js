import { apiFetch } from './api-client';
import type { Paginated } from '@/lib/types/common.types';
import type { GuideCard, GuideDetail } from '@/lib/types/guide.types';

export function getGuides(params?: { page?: number; tags?: string[]; exclude?: string }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.tags?.length) qs.set('tags', params.tags.join(','));
  if (params?.exclude) qs.set('exclude', params.exclude);
  const query = qs.toString();
  return apiFetch<Paginated<GuideCard>>(`/public/guides${query ? `?${query}` : ''}`, {
    revalidate: 600,
  });
}

export function getGuide(slug: string) {
  return apiFetch<GuideDetail>(`/public/guides/${slug}`, { revalidate: 600 });
}
