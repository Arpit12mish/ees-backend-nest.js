'use server';

import { revalidatePath } from 'next/cache';
import { deleteGuide } from '@/lib/api/guides.api';
import { getServerToken } from '@/lib/auth/server-token';

export async function deleteGuideAction(formData: FormData) {
  const id = String(formData.get('id'));
  const token = await getServerToken();
  await deleteGuide(id, token);
  revalidatePath('/guides');
}
