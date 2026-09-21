'use server';

import { revalidatePath } from 'next/cache';
import { deleteSeo } from '@/lib/api/seo.api';
import { getServerToken } from '@/lib/auth/server-token';

export async function deleteSeoAction(formData: FormData) {
  const id = String(formData.get('id'));
  const token = await getServerToken();
  await deleteSeo(id, token);
  revalidatePath('/seo');
}
