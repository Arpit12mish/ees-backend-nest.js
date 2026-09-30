export const CACHE_HEADERS = {
  // Image objects use long immutable cache because filenames are unique.
  // If a product image changes, generate a new key instead of overwriting.
  // For urgent replacements, purge the old Cloudflare cache entry manually.
  IMAGE_OBJECT: 'public, max-age=31536000, immutable',
  // Public catalog and SEO APIs are safe to cache at the edge.
  PRODUCT_LIST:
    'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  PRODUCT_DETAIL:
    'public, max-age=600, s-maxage=86400, stale-while-revalidate=604800',
  SITEMAP: 'public, max-age=3600, s-maxage=86400',
  MERCHANT_FEED: 'public, max-age=3600, s-maxage=21600',
  CATEGORY_LIST:
    'public, max-age=600, s-maxage=86400, stale-while-revalidate=604800',
  COLLECTION_LIST:
    'public, max-age=600, s-maxage=86400, stale-while-revalidate=604800',
  SERVICE_LIST:
    'public, max-age=600, s-maxage=86400, stale-while-revalidate=604800',
  HERO_REEL_LIST:
    'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  // Cart, order, payment, upload, auth, and admin APIs must not be cached.
  NO_STORE: 'no-store',
};
