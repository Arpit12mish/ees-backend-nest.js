import { apiFetch, apiMutation } from './api-client';
import type { SeoEntityType, SeoInput, SeoMetadataRecord } from '@/lib/types/seo.types';

export function getSeoRecords(token?: string | null) {
  return apiFetch<SeoMetadataRecord[]>('/admin/seo', { noStore: true, token });
}

export async function getSeoByEntity(
  entityType: SeoEntityType,
  entityId: string,
  token?: string | null,
): Promise<SeoMetadataRecord | null> {
  try {
    return await apiFetch<SeoMetadataRecord>(
      `/admin/seo/entity/${entityType}/${entityId}`,
      { noStore: true, token },
    );
  } catch {
    return null;
  }
}

export function getSeoById(id: string, token?: string | null) {
  return apiFetch<SeoMetadataRecord>(`/admin/seo/${id}`, { noStore: true, token });
}

export function upsertSeo(input: SeoInput, token?: string | null) {
  return apiMutation<SeoMetadataRecord>('/admin/seo', {
    method: 'PUT',
    body: JSON.stringify(input),
    token,
  });
}

export function deleteSeo(id: string, token?: string | null) {
  return apiMutation<null>(`/admin/seo/${id}`, { method: 'DELETE', token });
}
