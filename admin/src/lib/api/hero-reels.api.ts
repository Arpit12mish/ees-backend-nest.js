import { apiFetch, apiMutation } from './api-client';
import type { HeroReel, HeroReelInput } from '@/lib/types/hero-reel.types';

export function getHeroReels(token?: string | null) {
  return apiFetch<HeroReel[]>('/admin/hero-reels', { noStore: true, token });
}

export function getHeroReel(id: string, token?: string | null) {
  return apiFetch<HeroReel>(`/admin/hero-reels/${id}`, { noStore: true, token });
}

export function createHeroReel(input: HeroReelInput, token?: string | null) {
  return apiMutation<HeroReel>('/admin/hero-reels', {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
}

export function updateHeroReel(
  id: string,
  input: Partial<HeroReelInput>,
  token?: string | null,
) {
  return apiMutation<HeroReel>(`/admin/hero-reels/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    token,
  });
}

export function deleteHeroReel(id: string, token?: string | null) {
  return apiMutation<null>(`/admin/hero-reels/${id}`, {
    method: 'DELETE',
    token,
  });
}
