import { apiFetch } from './api-client';
import type { AdminAuthResponse, AdminUser } from '@/lib/types/auth.types';

export function login(email: string, password: string) {
  return apiFetch<AdminAuthResponse>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    noStore: true,
  });
}

export function getMe(token?: string | null) {
  return apiFetch<AdminUser>('/admin/auth/me', { noStore: true, token });
}
