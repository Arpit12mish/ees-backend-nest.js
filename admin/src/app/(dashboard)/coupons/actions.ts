'use server';

import { revalidatePath } from 'next/cache';
import { deleteCoupon } from '@/lib/api/coupons.api';
import { getServerToken } from '@/lib/auth/server-token';

export async function deleteCouponAction(formData: FormData) {
  const id = String(formData.get('id'));
  const token = await getServerToken();
  await deleteCoupon(id, token);
  revalidatePath('/coupons');
}
