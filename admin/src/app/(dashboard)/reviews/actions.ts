'use server';

import { revalidatePath } from 'next/cache';
import { deleteReview, setReviewApproval } from '@/lib/api/reviews.api';
import { getServerToken } from '@/lib/auth/server-token';

export async function approveReviewAction(formData: FormData) {
  const id = String(formData.get('id'));
  const token = await getServerToken();
  await setReviewApproval(id, true, token);
  revalidatePath('/reviews');
}

export async function rejectReviewAction(formData: FormData) {
  const id = String(formData.get('id'));
  const token = await getServerToken();
  await setReviewApproval(id, false, token);
  revalidatePath('/reviews');
}

export async function deleteReviewAction(formData: FormData) {
  const id = String(formData.get('id'));
  const token = await getServerToken();
  await deleteReview(id, token);
  revalidatePath('/reviews');
}
