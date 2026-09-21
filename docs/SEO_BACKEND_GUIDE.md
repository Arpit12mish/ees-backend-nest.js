# SEO Backend Guide

## SEO Metadata Model

SEO metadata is stored in `SeoMetadata`.

Supported entity types:

- `PRODUCT`
- `CATEGORY`
- `COLLECTION`
- `HOME`

Important fields:

- `seoTitle`
- `seoDescription`
- `seoKeywords`
- `canonicalUrl`
- `ogTitle`
- `ogDescription`
- `ogImageUrl`
- `twitterTitle`
- `twitterDescription`
- `twitterImageUrl`
- `schemaType`

The database enforces one SEO metadata row per `[entityType, entityId]`.

## Public SEO APIs

| API | Purpose |
| --- | --- |
| `GET /api/public/seo/product/:slug` | Metadata for a published product. |
| `GET /api/public/seo/category/:slug` | Metadata for an active category. |
| `GET /api/public/seo/collection/:slug` | Metadata for an active collection. |
| `GET /api/public/seo/product-schema/:slug` | Product JSON-LD. |
| `GET /api/public/sitemap-data` | Sitemap source data for frontend. |

## Admin SEO APIs

| API | Purpose |
| --- | --- |
| `GET /api/admin/seo` | List SEO metadata. |
| `GET /api/admin/seo/entity/:entityType/:entityId` | Get SEO metadata by entity. |
| `GET /api/admin/seo/:id` | Get SEO metadata by id. |
| `POST /api/admin/seo` | Create SEO metadata. |
| `PUT /api/admin/seo` | Upsert SEO metadata. |
| `PATCH /api/admin/seo/:id` | Update SEO metadata. |
| `DELETE /api/admin/seo/:id` | Delete SEO metadata. |

## Fallback Strategy

When metadata is missing, `SeoService` generates defaults.

Product fallback:

- title: product name plus brand
- description: product short description, or safe default wording
- image: product `detailUrl`, then `cardUrl`, then `imageUrl`
- canonical URL: `${FRONTEND_BASE_URL}/products/:slug`

Category fallback:

- title: category name plus brand
- description: category description, or safe default wording
- image: category `imageUrl`
- canonical URL: `${FRONTEND_BASE_URL}/categories/:slug`

Collection fallback:

- title: collection name plus brand
- description: collection description, or safe default wording
- image: collection `imageUrl`
- canonical URL: `${FRONTEND_BASE_URL}/collections/:slug`

## Open Graph and Twitter

Open Graph fields fall back to SEO title/description/image.

Twitter fields fall back to Twitter-specific fields first, then Open Graph fields, then SEO defaults.

## Product JSON-LD

`GET /api/public/seo/product-schema/:slug` returns:

- `@context`
- `@type: Product`
- `name`
- `description`
- `image`
- `sku`
- `brand`
- `offers`
- `price`
- `priceCurrency`
- `availability`
- `url`

Availability mapping:

- `IN_STOCK` -> `https://schema.org/InStock`
- `LOW_STOCK` -> `https://schema.org/LimitedAvailability`
- `OUT_OF_STOCK` -> `https://schema.org/OutOfStock`

## Sitemap Data

`GET /api/public/sitemap-data` returns active public URLs for:

- published products in active categories
- active categories
- active collections

URLs are built from `FRONTEND_BASE_URL`.

## Safe Wording Rules

Never make medical or guaranteed spiritual claims.

Use:

- traditionally associated with
- believed to support
- commonly used for
- often chosen for
- symbolizes

Avoid:

- cures
- heals disease
- guarantees wealth
- removes all negativity
- fixes anxiety
- treats depression
- scientifically proven healing unless backed by proper evidence and reviewed legally

## Product Copy Guidance

Good:

```text
Rose quartz is traditionally associated with love, compassion, and emotional balance.
```

Avoid:

```text
Rose quartz heals heartbreak and cures emotional trauma.
```

## Image Alt Text Rules

Alt text should:

- describe the visible product
- include material/type where useful
- avoid keyword stuffing
- avoid guaranteed benefit claims

Good:

```text
Rose quartz bracelet with natural pink crystal beads
```

Avoid:

```text
Best healing bracelet guaranteed to attract love
```

## Frontend Usage for Next.js Metadata

Recommended frontend calls:

- Product page metadata: `/api/public/seo/product/:slug`
- Category page metadata: `/api/public/seo/category/:slug`
- Collection page metadata: `/api/public/seo/collection/:slug`
- Product JSON-LD script: `/api/public/seo/product-schema/:slug`
- Sitemap generation: `/api/public/sitemap-data`

Use public product detail APIs for page content and image variants.
