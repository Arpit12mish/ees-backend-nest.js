'use server';

import { revalidatePath } from 'next/cache';
import { deleteService } from '@/lib/api/services.api';
import { getServerToken } from '@/lib/auth/server-token';

export async function deleteServiceAction(formData: FormData) {
  const id = String(formData.get('id'));
  const token = await getServerToken();
  await deleteService(id, token);
  revalidatePath('/services');
}
