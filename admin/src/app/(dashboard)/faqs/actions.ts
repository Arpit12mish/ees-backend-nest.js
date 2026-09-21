'use server';

import { revalidatePath } from 'next/cache';
import { deleteFaq } from '@/lib/api/faqs.api';
import { getServerToken } from '@/lib/auth/server-token';

export async function deleteFaqAction(formData: FormData) {
  const id = String(formData.get('id'));
  const token = await getServerToken();
  await deleteFaq(id, token);
  revalidatePath('/faqs');
}
