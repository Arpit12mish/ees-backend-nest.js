export type AdminRoleValue = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'PARTNER';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRoleValue;
};

export type AdminAuthResponse = {
  accessToken: string;
  admin: AdminUser;
};
