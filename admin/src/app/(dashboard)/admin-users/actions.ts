'use server';

import { revalidatePath } from 'next/cache';
import { setAdminUserActive } from '@/lib/api/admin-users.api';
import { getServerToken } from '@/lib/auth/server-token';

export async function deactivateAdminUserAction(formData: FormData) {
  const id = String(formData.get('id'));
  const token = await getServerToken();
  await setAdminUserActive(id, false, token);
  revalidatePath('/admin-users');
}

export async function reactivateAdminUserAction(formData: FormData) {
  const id = String(formData.get('id'));
  const token = await getServerToken();
  await setAdminUserActive(id, true, token);
  revalidatePath('/admin-users');
}
