import { apiFetch, apiMutation } from './api-client';
import type { Guide, GuideInput } from '@/lib/types/guide.types';

export function getGuides(token?: string | null) {
  return apiFetch<Guide[]>('/admin/guides', { noStore: true, token });
}

export function getGuide(id: string, token?: string | null) {
  return apiFetch<Guide>(`/admin/guides/${id}`, { noStore: true, token });
}

export function createGuide(input: GuideInput, token?: string | null) {
  return apiMutation<Guide>('/admin/guides', {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
}

export function updateGuide(
  id: string,
  input: Partial<GuideInput>,
  token?: string | null,
) {
  return apiMutation<Guide>(`/admin/guides/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    token,
  });
}

export function deleteGuide(id: string, token?: string | null) {
  return apiMutation<null>(`/admin/guides/${id}`, { method: 'DELETE', token });
}
