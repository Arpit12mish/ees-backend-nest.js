import { apiFetch, apiMutation } from './api-client';
import type { AdminUserAccount, CreateAdminUserInput } from '@/lib/types/admin-user.types';

export function getAdminUsers(token?: string | null) {
  return apiFetch<AdminUserAccount[]>('/admin/admin-users', { noStore: true, token });
}

export function createAdminUser(input: CreateAdminUserInput, token?: string | null) {
  return apiMutation<AdminUserAccount>('/admin/admin-users', {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
}

export function setAdminUserActive(id: string, isActive: boolean, token?: string | null) {
  return apiMutation<AdminUserAccount>(`/admin/admin-users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
    token,
  });
}
