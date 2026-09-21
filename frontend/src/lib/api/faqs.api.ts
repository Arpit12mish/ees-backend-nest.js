import { apiFetch } from './api-client';
import type { Faq, FaqEntityType } from '@/lib/types/faq.types';

export function getGlobalFaqs() {
  return apiFetch<Faq[]>('/public/faqs/global', { revalidate: 3600 });
}

export function getEntityFaqs(entityType: FaqEntityType, entityId: string) {
  return apiFetch<Faq[]>(`/public/faqs/${entityType}/${entityId}`, {
    revalidate: 3600,
  });
}
