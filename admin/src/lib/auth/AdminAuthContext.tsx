'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { AdminUser } from '@/lib/types/auth.types';

const AdminAuthContext = createContext<AdminUser | null>(null);

export function AdminAuthProvider({
  admin,
  children,
}: {
  admin: AdminUser;
  children: ReactNode;
}) {
  return (
    <AdminAuthContext.Provider value={admin}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminUser {
  const admin = useContext(AdminAuthContext);
  if (!admin) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return admin;
}
