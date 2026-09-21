'use server';

import { revalidatePath } from 'next/cache';
import {
  deleteCollection,
  removeProductFromCollection,
  updateCollectionProductSortOrder,
} from '@/lib/api/collections.api';
import { getServerToken } from '@/lib/auth/server-token';

export async function deleteCollectionAction(formData: FormData) {
  const id = String(formData.get('id'));
  const token = await getServerToken();
  await deleteCollection(id, token);
  revalidatePath('/collections');
}

export async function removeProductAction(formData: FormData) {
  const collectionId = String(formData.get('collectionId'));
  const productId = String(formData.get('productId'));
  const token = await getServerToken();
  await removeProductFromCollection(collectionId, productId, token);
  revalidatePath(`/collections/${collectionId}`);
}

export async function updateSortOrderAction(formData: FormData) {
  const collectionId = String(formData.get('collectionId'));
  const productId = String(formData.get('productId'));
  const sortOrder = Number(formData.get('sortOrder'));
  const token = await getServerToken();
  await updateCollectionProductSortOrder(collectionId, productId, sortOrder, token);
  revalidatePath(`/collections/${collectionId}`);
}
