import { API_BASE_URL } from '@/lib/api/api-client';

// The uploads endpoint's local-storage driver returns a relative URL
// (/uploads/...) meant to be served from the BACKEND origin, not from
// wherever the caller happens to be running. R2/S3 drivers already return
// absolute URLs and pass through unchanged.
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export function resolveImageUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${BACKEND_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}
