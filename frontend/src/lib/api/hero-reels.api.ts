import { apiFetch } from './api-client';
import type { HeroReel } from '@/lib/types/hero-reel.types';

export function getHeroReels() {
  return apiFetch<HeroReel[]>('/public/hero-reels', { revalidate: 300 });
}
