// Plain utility (no JSX/hooks) — safe to import from Server Components,
// Client Components, and middleware.ts alike. The document-touching
// functions below no-op outside the browser via the typeof guard.
export const AUTH_COOKIE_NAME = 'ees_admin_token';

export function setClientToken(token: string, maxAgeSeconds = 60 * 60 * 24): void {
  if (typeof document === 'undefined') return;
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? '; Secure'
      : '';
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

export function clearClientToken(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function getClientToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${AUTH_COOKIE_NAME}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}
