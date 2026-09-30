import { apiMutation } from './api-client';
import type { UploadImageResult, UploadVideoResult } from '@/lib/types/upload.types';

export function uploadImage(file: File, token?: string | null) {
  const formData = new FormData();
  formData.append('file', file);
  return apiMutation<UploadImageResult>('/admin/uploads/image', {
    method: 'POST',
    body: formData,
    token,
  });
}

export function uploadVideo(file: File, token?: string | null) {
  const formData = new FormData();
  formData.append('file', file);
  return apiMutation<UploadVideoResult>('/admin/uploads/video', {
    method: 'POST',
    body: formData,
    token,
  });
}
