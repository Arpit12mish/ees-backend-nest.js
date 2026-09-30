import type { AdminRoleValue } from '@/lib/types/auth.types';

// This matrix mirrors the backend's @Roles(...) guards for UX purposes only
// (hiding/disabling controls a role can't use). It is NOT a security
// boundary — the backend's JwtAuthGuard/RolesGuard enforce the real rules
// and will 403 regardless of what this UI shows or hides.
export const PERMISSIONS = {
  'categories.write': ['SUPER_ADMIN', 'ADMIN'],
  'products.write': ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'PARTNER'],
  'products.statusChange': ['SUPER_ADMIN', 'ADMIN', 'PARTNER'],
  'products.delete': ['SUPER_ADMIN', 'ADMIN'],
  'products.images.write': ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'PARTNER'],
  'products.images.delete': ['SUPER_ADMIN', 'ADMIN'],
  'collections.write': ['SUPER_ADMIN', 'ADMIN'],
  'collections.products.assign': ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
  'collections.products.remove': ['SUPER_ADMIN', 'ADMIN'],
  'coupons.write': ['SUPER_ADMIN', 'ADMIN'],
  'seo.write': ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'PARTNER'],
  'seo.delete': ['SUPER_ADMIN', 'ADMIN'],
  'adminUsers.write': ['SUPER_ADMIN'],
  'inventory.write': ['SUPER_ADMIN', 'ADMIN'],
  'orders.write': ['SUPER_ADMIN', 'ADMIN'],
  'contactLeads.write': ['SUPER_ADMIN', 'ADMIN'],
  'services.write': ['SUPER_ADMIN', 'ADMIN'],
  'heroReels.write': ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
  'heroReels.delete': ['SUPER_ADMIN', 'ADMIN'],
  'serviceBookings.write': ['SUPER_ADMIN', 'ADMIN'],
  'reviews.write': ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
  'reviews.delete': ['SUPER_ADMIN', 'ADMIN'],
  'guides.write': ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
  'guides.delete': ['SUPER_ADMIN', 'ADMIN'],
  'faqs.write': ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
  'faqs.delete': ['SUPER_ADMIN', 'ADMIN'],
} as const satisfies Record<string, readonly AdminRoleValue[]>;

export type PermissionKey = keyof typeof PERMISSIONS;

export function can(
  role: AdminRoleValue | undefined,
  key: PermissionKey,
): boolean {
  if (!role) return false;
  return (PERMISSIONS[key] as readonly AdminRoleValue[]).includes(role);
}
