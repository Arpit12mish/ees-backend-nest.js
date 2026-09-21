'use server';

import { revalidatePath } from 'next/cache';
import { deleteProduct } from '@/lib/api/products.api';
import { getServerToken } from '@/lib/auth/server-token';

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get('id'));
  const token = await getServerToken();
  await deleteProduct(id, token);
  revalidatePath('/products');
}
