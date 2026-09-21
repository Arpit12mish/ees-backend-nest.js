import { apiFetch, apiMutation } from './api-client';
import type { Faq, FaqInput } from '@/lib/types/faq.types';

export function getFaqs(token?: string | null) {
  return apiFetch<Faq[]>('/admin/faqs', { noStore: true, token });
}

export function getFaq(id: string, token?: string | null) {
  return apiFetch<Faq>(`/admin/faqs/${id}`, { noStore: true, token });
}

export function createFaq(input: FaqInput, token?: string | null) {
  return apiMutation<Faq>('/admin/faqs', {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
}

export function updateFaq(
  id: string,
  input: Partial<FaqInput>,
  token?: string | null,
) {
  return apiMutation<Faq>(`/admin/faqs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    token,
  });
}

export function deleteFaq(id: string, token?: string | null) {
  return apiMutation<null>(`/admin/faqs/${id}`, { method: 'DELETE', token });
}
