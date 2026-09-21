# SEO Implementation

## Overview

SEO is implemented at two levels:

1. **Page-level metadata** — Next.js `Metadata` objects exported from each page, consumed by the App Router to generate `<head>` tags.
2. **Structured data** — Product JSON-LD rendered as a `<script type="application/ld+json">` block on product detail pages.

All dynamic metadata is fetched from the backend SEO API, with fallbacks for when the backend is unavailable.

## `generateMetadata`

Dynamic routes export an async `generateMetadata` function. Next.js calls this at render time (or at ISR revalidation time) to generate `<meta>` tags.

```ts
// src/app/products/[slug]/page.tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getProductSeo(slug).catch(() => null);
  return metadataFromSeo(seo, {
    title: 'Product',
    path: `/products/${slug}`,
  });
}
```

Routes with `generateMetadata`:
- `/products/[slug]` — fetches from `GET /api/public/seo/product/:slug`
- `/categories/[slug]` — fetches from `GET /api/public/seo/category/:slug`
- `/collections/[slug]` — fetches from `GET /api/public/seo/collection/:slug`

## `metadataFromSeo`

`src/lib/utils/seo.ts` provides `metadataFromSeo`, which builds a Next.js `Metadata` object from the backend `SeoMetadata` shape.

What it produces:
- `title` — from `seo.title`, or the fallback title
- `description` — from `seo.description`, or the default store description
- `keywords` — from `seo.keywords`
- `alternates.canonical` — from `seo.canonicalUrl`, or `${SITE_URL}${path}`
- `openGraph.title` — from `seo.openGraph.title`, or the title
- `openGraph.description` — from `seo.openGraph.description`, or the description
- `openGraph.url` — canonical URL
- `openGraph.siteName` — "Energy Essentials"
- `openGraph.images` — from `seo.openGraph.image` or `seo.twitter.image`
- `openGraph.type` — always "website"
- `twitter.card` — "summary_large_image" if an image exists, otherwise "summary"
- `twitter.title` — from `seo.twitter.title`, or the title
- `twitter.description` — from `seo.twitter.description`, or the description
- `twitter.images` — from `seo.twitter.image`

## Root Layout Metadata

`src/app/layout.tsx` sets a `metadataBase` and a title template:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Energy Essentials | Crystals, Stones, and Mindful Energy Products',
    template: '%s | Energy Essentials',
  },
  description: 'Discover crystals, stones, and mindful energy products ...',
};
```

The `template` means every page title becomes "{page title} | Energy Essentials".

## Homepage Metadata

Static metadata in `src/app/page.tsx`:

```ts
export const metadata: Metadata = {
  title: 'Crystals, Stones, and Mindful Energy Products',
  description: '...',
};
```

Combined with the template: "Crystals, Stones, and Mindful Energy Products | Energy Essentials".

## JSON-LD Rendering

`ProductSeoJsonLd` renders the backend-provided Product JSON-LD:

```ts
// src/components/products/ProductSeoJsonLd.tsx
export function ProductSeoJsonLd({ data }: { data: ProductJsonLd }) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

The data comes from `GET /api/public/seo/product-schema/:slug`. The backend constructs a `Product` schema with brand, SKU, image, offer, price, currency, availability, and URL. The frontend does not modify the JSON-LD; it serializes it directly.

`suppressHydrationWarning` prevents React from flagging the `dangerouslySetInnerHTML` content as a hydration mismatch.

## Sitemap Generation

`src/app/sitemap.ts` returns a `MetadataRoute.Sitemap` array combining:

1. **Static routes** — homepage, /products, /categories, /collections, /about-us, /contact-us, /privacy-policy, /terms-and-conditions, /shipping-policy, /return-policy. All use `changeFrequency: 'weekly'` and `priority: 0.7` (homepage gets `priority: 1`).
2. **Backend routes** — fetched from `GET /api/public/sitemap-data`, which returns published products, active categories, and active collections with their slugs, `lastModified`, `changeFrequency`, and `priority`.

The sitemap revalidates every 3600 seconds. If the backend is unavailable, only static routes are returned.

## Robots Generation

`src/app/robots.ts` returns:

```
User-agent: *
Allow: /
Disallow: /cart
Disallow: /checkout
Disallow: /order-success
Disallow: /admin
Sitemap: {SITE_URL}/sitemap.xml
```

## Canonical URL Handling

Canonical URLs are constructed as:
- From backend `seo.canonicalUrl` if present (backend uses `FRONTEND_BASE_URL` to build canonical URLs)
- Otherwise `${SITE_URL}${path}` using `NEXT_PUBLIC_SITE_URL`

It is important that `NEXT_PUBLIC_SITE_URL` matches `FRONTEND_BASE_URL` in the backend environment, otherwise canonical URLs in the backend SEO data will not match what the frontend generates.

## Image Alt Text

- `ProductCard`: uses `product.primaryImage.altText` if present, falls back to `product.name`
- `ProductImageGallery`: uses `image.altText` if present, falls back to `productName`
- `HeroSection`: uses `product.primaryImage.altText` or `product.name` or `'Crystal product'`
- `SafeProductImage`: passes `alt` through from the caller

## Safe Wording Rules

Product copy and metadata descriptions must follow these rules:

Allowed phrases:
- "traditionally associated with"
- "believed to support"
- "commonly used for"
- "often chosen for"
- "symbolizes"

Not allowed:
- "will bring you"
- "cures"
- "heals"
- "guaranteed to"
- "treats"
- Any medical or diagnostic language

The default store description is:
> "Discover crystals, stones, and mindful energy products traditionally associated with positivity, balance, protection, and intentional living."

This wording appears in the root layout metadata, the homepage metadata, and the `safeDescription` fallback in `lib/utils/seo.ts`.

## Backend SEO Dependency

If the backend SEO API is unavailable:
- `generateMetadata` catches the error (`.catch(() => null)`) and passes `null` to `metadataFromSeo`
- `metadataFromSeo` uses the fallback title and generates a canonical URL from `SITE_URL` and the path
- The page still renders with reasonable (if basic) metadata
- JSON-LD is omitted from the product detail page when the schema fetch fails
