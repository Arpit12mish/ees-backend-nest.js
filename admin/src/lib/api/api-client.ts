import type { ApiEnvelope } from '@/lib/types/common.types';
import { clearClientToken } from '@/lib/auth/token-cookie';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api';

// Every authenticated call takes `token` explicitly rather than this module
// reaching for next/headers itself — that keeps this file safely importable
// from both Server Components and Client Components. Server callers pass a
// token read via cookies() from next/headers; client callers pass
// getClientToken(). `token` is omitted only for the unauthenticated login call.
type FetchOptions = RequestInit & {
  revalidate?: number;
  noStore?: boolean;
  token?: string | null;
};

export function unwrapApiResponse<T>(response: ApiEnvelope<T>): T {
  if (!response || response.success !== true) {
    throw new Error(response.message || 'API request failed');
  }
  return response.data;
}

async function readApiEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return {
      success: false,
      message: response.ok ? 'Empty API response' : `Request failed: ${response.status}`,
      data: null as T,
    };
  }

  return (await response.json()) as ApiEnvelope<T>;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { revalidate, noStore, token, headers, ...init } = options;
  const isFormData =
    typeof FormData !== 'undefined' && init.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: noStore ? 'no-store' : init.cache,
    next: noStore ? undefined : { revalidate },
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      clearClientToken();
      // Intentional hard navigation, not router.push(): this is a plain
      // utility function with no access to a Client Component's useRouter,
      // and a full reload is fine (desirable, even) on session expiry.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  const body = await readApiEnvelope<T>(response);

  if (!response.ok || !body.success) {
    throw new Error(body.message || `Request failed: ${response.status}`);
  }

  return unwrapApiResponse(body);
}

export async function apiMutation<T>(
  path: string,
  init: RequestInit & { token?: string | null },
): Promise<T> {
  return apiFetch<T>(path, { ...init, noStore: true });
}
