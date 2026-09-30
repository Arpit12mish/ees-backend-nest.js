import type { AdminRoleValue } from './auth.types';

export type AdminUserAccount = {
  id: string;
  name: string;
  email: string;
  role: AdminRoleValue;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateAdminUserInput = {
  name: string;
  email: string;
  password: string;
  role: AdminRoleValue;
};
