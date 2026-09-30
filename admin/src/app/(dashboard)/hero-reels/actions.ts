'use server';

import { revalidatePath } from 'next/cache';
import { deleteHeroReel } from '@/lib/api/hero-reels.api';
import { getServerToken } from '@/lib/auth/server-token';

export async function deleteHeroReelAction(formData: FormData) {
  const id = String(formData.get('id'));
  const token = await getServerToken();
  await deleteHeroReel(id, token);
  revalidatePath('/hero-reels');
}
