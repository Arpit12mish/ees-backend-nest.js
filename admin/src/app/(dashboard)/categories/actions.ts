'use server';

import { revalidatePath } from 'next/cache';
import { deleteCategory } from '@/lib/api/categories.api';
import { getServerToken } from '@/lib/auth/server-token';

export async function deleteCategoryAction(formData: FormData) {
  const id = String(formData.get('id'));
  const token = await getServerToken();
  await deleteCategory(id, token);
  revalidatePath('/categories');
}
