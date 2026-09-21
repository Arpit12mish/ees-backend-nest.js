# Frontend Architecture

## Next.js App Router

The frontend uses the Next.js App Router introduced in Next.js 13 and stabilized in 14+. All routes live under `src/app/`. Each `page.tsx` is a React Server Component by default.

## Server Components vs Client Components

### Server Components (default)

Pages that only need to fetch data and render HTML use no directive and are Server Components. They fetch data directly in the component body using `async/await` with the `apiFetch` helper, which leverages Next.js fetch caching.

Server Component pages:
- `app/page.tsx` (homepage)
- `app/products/page.tsx`
- `app/products/[slug]/page.tsx`
- `app/categories/page.tsx`
- `app/categories/[slug]/page.tsx`
- `app/collections/page.tsx`
- `app/collections/[slug]/page.tsx`
- `app/order-success/page.tsx`
- All static pages (about-us, contact-us, privacy-policy, etc.)

### Client Components

Pages and components that use browser APIs (localStorage, window events, useState, useEffect) are marked `'use client'`.

Client Component pages:
- `app/cart/page.tsx` — reads localStorage session ID, listens for cart events
- `app/checkout/page.tsx` — form submission, router.push after payment

Client Component components:
- `components/layout/CartLink.tsx` — reads cart count from backend on mount, listens for cart events
- `components/layout/MobileNav.tsx` — open/close toggle state
- `components/cart/AddToCartButton.tsx` — POST to backend, dispatch cart event
- `components/cart/CartItem.tsx` — quantity controls, remove action
- `components/cart/CartSummary.tsx` — coupon input, checkout link
- `components/products/ProductImageGallery.tsx` — selected image state
- `components/products/SafeProductImage.tsx` — error state for broken images

API client files that are `'use client'`:
- `lib/api/cart.api.ts`
- `lib/api/orders.api.ts`
- `lib/api/payments.api.ts`
- `lib/api/coupons.api.ts` (re-export only)
- `lib/utils/session-id.ts`

## API Client Structure

All API calls go through `src/lib/api/api-client.ts`.

### `apiFetch<T>(path, options)`

Used by Server Components for catalog data. Supports ISR via the `revalidate` option, which maps to Next.js `fetch` cache control. Pass `noStore: true` for mutations or cart data.

```ts
apiFetch<ProductCardProduct[]>('/public/products/featured', { revalidate: 300 })
```

### `apiMutation<T>(path, init)`

Thin wrapper around `apiFetch` with `noStore: true` enforced. Used for POST, PATCH, DELETE requests.

```ts
apiMutation<Cart>('/cart/items', { method: 'POST', body: JSON.stringify(input) })
```

### `unwrapApiResponse<T>(envelope)`

Throws if `success !== true`. Returns `envelope.data`. Used when calling fetch directly (cart.api.ts, orders.api.ts) to avoid double-unwrapping.

## Data Fetching Strategy

### ISR (Incremental Static Regeneration)

Server Component pages fetch data with a `revalidate` window. Pages are cached at the CDN level and revalidated in the background after the specified seconds.

| Data type | Revalidate |
| --- | --- |
| Featured products | 300s (5 min) |
| Product listing | 300s |
| Product search | 300s |
| Category products | 300s |
| Collection products | 300s |
| Product detail | 600s (10 min) |
| Category detail | 600s |
| Collection detail | 600s |
| SEO metadata | 600s |
| Sitemap data | 3600s (1 hr) |

### No-store (real-time)

Cart, order, and payment calls use `cache: 'no-store'`. These are always fetched fresh from the backend. They run in Client Components where the user has already interacted with the page.

## Layout Structure

```
app/layout.tsx          — root layout: <html>, <body>, <Header>, <main>, <Footer>
app/loading.tsx         — root loading boundary: shows LoadingState
app/error.tsx           — root error boundary: shows ErrorState with reset button
```

`Header` includes `CartLink` (client, reads cart count) and `MobileNav` (client, toggle). `Footer` is a static server component.

There is one root layout and no nested layouts.

## Error and Loading State Strategy

- `app/error.tsx` is a client error boundary for the root segment. It shows an ErrorState and a "Try again" button that calls `reset()`.
- `app/loading.tsx` is the root loading boundary. It shows a spinner during server component data fetching.
- Individual pages that fetch optional data use `.catch(() => null)` or `.catch(() => [])` and render an `<ErrorState>` component inline when data is null.
- Dynamic pages like `/products/[slug]` call `notFound()` when the backend returns no product, which renders the Next.js 404 page.

## Image Handling Strategy

All product images use `next/image` with `fill` layout inside a positioned container. `SafeProductImage` wraps `next/image` and falls back to a placeholder div if the image URL is missing or the `onError` event fires.

See [IMAGE_HANDLING.md](IMAGE_HANDLING.md) for the full priority chain.

## SEO Rendering Strategy

Each dynamic route exports an async `generateMetadata` function that:
1. Fetches SEO metadata from the backend.
2. Falls back gracefully if the backend is unavailable.
3. Calls `metadataFromSeo` in `lib/utils/seo.ts` to build the Next.js `Metadata` object with title, description, keywords, canonical URL, OpenGraph, and Twitter Card.

Product detail pages additionally render a `<ProductSeoJsonLd>` component that injects the backend-provided Product JSON-LD into a `<script type="application/ld+json">` tag.

## Cart and Session Strategy

Guest session IDs are generated in `lib/utils/session-id.ts` using `crypto.randomUUID()` (with a fallback) and stored in `localStorage` under key `ees_guest_session_id`. The session ID is read whenever a cart operation is needed. It is never sent to the server in a cookie or header; it is passed in the JSON request body.

Cart state is synchronized across components via a custom DOM event `ees-cart-updated` dispatched on `window`. Both `CartLink` and `CartPage` listen for this event and re-fetch the cart from the backend.
