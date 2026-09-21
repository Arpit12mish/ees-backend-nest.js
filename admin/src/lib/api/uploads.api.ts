import { apiMutation } from './api-client';
import type { UploadImageResult } from '@/lib/types/upload.types';

export function uploadImage(file: File, token?: string | null) {
  const formData = new FormData();
  formData.append('file', file);
  return apiMutation<UploadImageResult>('/admin/uploads/image', {
    method: 'POST',
    body: formData,
    token,
  });
}
