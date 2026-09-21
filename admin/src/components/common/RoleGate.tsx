'use client';

import type { ReactNode } from 'react';
import { useAdminAuth } from '@/lib/auth/AdminAuthContext';
import { can, type PermissionKey } from '@/lib/auth/permissions';

// UX-only gating — see the comment in permissions.ts. Wrap any mutation
// control (buttons, forms) that a role shouldn't see; never rely on this
// alone for anything security-sensitive.
export function RoleGate({
  permission,
  children,
  fallback = null,
}: {
  permission: PermissionKey;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const admin = useAdminAuth();
  return can(admin.role, permission) ? <>{children}</> : <>{fallback}</>;
}
