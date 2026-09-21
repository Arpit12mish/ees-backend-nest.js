import { apiFetch, apiMutation } from './api-client';
import type { ContactLead, ContactLeadStatus } from '@/lib/types/contactLead.types';

export function getContactLeads(token?: string | null) {
  return apiFetch<ContactLead[]>('/admin/contact-leads', { noStore: true, token });
}

export function getContactLead(id: string, token?: string | null) {
  return apiFetch<ContactLead>(`/admin/contact-leads/${id}`, { noStore: true, token });
}

export function updateContactLeadStatus(
  id: string,
  status: ContactLeadStatus,
  token?: string | null,
) {
  return apiMutation<ContactLead>(`/admin/contact-leads/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    token,
  });
}
