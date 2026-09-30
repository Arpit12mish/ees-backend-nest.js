import type { ApiEnvelope } from '@/lib/types/common.types';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api';

type FetchOptions = RequestInit & {
  revalidate?: number;
  noStore?: boolean;
  tags?: string[];
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
  const { revalidate, noStore, tags, headers, ...init } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    cache: noStore ? 'no-store' : init.cache,
    next: noStore ? undefined : { revalidate, tags },
  });

  const body = await readApiEnvelope<T>(response);

  if (!response.ok || !body.success) {
    throw new Error(body.message || `Request failed: ${response.status}`);
  }

  return unwrapApiResponse(body);
}

export async function apiMutation<T>(
  path: string,
  init: RequestInit,
): Promise<T> {
  return apiFetch<T>(path, { ...init, noStore: true });
}
