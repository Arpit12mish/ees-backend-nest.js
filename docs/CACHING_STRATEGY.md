# Caching Strategy

Caching is implemented with HTTP `Cache-Control` headers.

## Public Catalog and SEO APIs

Public read APIs are cacheable because they expose public product/category/collection/SEO data.

| API Area | Header |
| --- | --- |
| Product listing/search/category/featured | `public, max-age=300, s-maxage=3600, stale-while-revalidate=86400` |
| Product detail | `public, max-age=600, s-maxage=86400, stale-while-revalidate=604800` |
| Categories | `public, max-age=600, s-maxage=86400, stale-while-revalidate=604800` |
| Collections | `public, max-age=600, s-maxage=86400, stale-while-revalidate=604800` |
| SEO endpoints | `public, max-age=600, s-maxage=86400, stale-while-revalidate=604800` |
| Sitemap data | `public, max-age=3600, s-maxage=86400` |

Constants live in:

```text
src/common/constants/cache.constants.ts
```

## Image Object Caching

Image objects use:

```http
Cache-Control: public, max-age=31536000, immutable
```

Reason:

- upload filenames are unique
- replacing an image should create a new key
- long browser/CDN caching is safe

For Cloudflare R2, the object upload sets this header. For local development, Express static serving also uses long static caching.

## No-Store APIs

Private or dynamic APIs are marked:

```http
Cache-Control: no-store
```

Implemented by:

```text
src/common/middleware/cache-control.middleware.ts
```

No-store prefixes:

- `/api/admin`
- `/api/cart`
- `/api/orders`
- `/api/payments`
- `/api/coupons`

This covers:

- admin APIs
- auth APIs under `/api/admin/auth`
- cart APIs
- order APIs
- payment APIs
- upload APIs under `/api/admin/uploads`
- coupon validation/removal APIs

## Current State

Caching is implemented at the HTTP header layer. There is no Redis or server-side response cache.

## Recommended Next Steps

When traffic grows:

1. Put Cloudflare or another CDN in front of public APIs.
2. Respect the current `s-maxage` and `stale-while-revalidate` headers.
3. Add manual purge workflow for urgent product/SEO corrections.
4. Consider Redis only when server-side cached reads, shared rate limiting, or queues are needed.
