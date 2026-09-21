'use client';

import type { ContactLeadInput, ContactLeadResponse } from '@/lib/types/contact.types';
import { apiMutation } from './api-client';

export function submitContactLead(
  input: ContactLeadInput,
): Promise<ContactLeadResponse> {
  return apiMutation<ContactLeadResponse>('/public/contact', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
