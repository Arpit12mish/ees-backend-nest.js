# Folder Structure

```
frontend/
  src/
    app/                          — Next.js App Router pages and special files
    components/                   — Reusable React components
    lib/                          — API clients, types, and utilities
  public/                         — Static assets (currently empty)
  next.config.ts                  — Next.js configuration
  tsconfig.json                   — TypeScript configuration
  postcss.config.mjs              — PostCSS/Tailwind configuration
  eslint.config.mjs               — ESLint configuration
  package.json                    — Dependencies and scripts
  .env.example                    — Example environment file
```

## src/app/

Next.js App Router directory. Each subfolder with a `page.tsx` becomes a route.

```
app/
  layout.tsx                      — Root layout: wraps all pages with Header and Footer
  page.tsx                        — Homepage /
  loading.tsx                     — Root loading boundary
  error.tsx                       — Root error boundary (client)
  globals.css                     — CSS custom properties and base resets

  products/
    page.tsx                      — /products: product listing with search
    [slug]/
      page.tsx                    — /products/[slug]: product detail

  categories/
    page.tsx                      — /categories: category grid
    [slug]/
      page.tsx                    — /categories/[slug]: category products

  collections/
    page.tsx                      — /collections: collection grid
    [slug]/
      page.tsx                    — /collections/[slug]: collection products

  cart/
    page.tsx                      — /cart: guest cart (client component)

  checkout/
    page.tsx                      — /checkout: shipping form + mock payment (client)

  order-success/
    page.tsx                      — /order-success: confirmation, reads ?orderNumber=

  about-us/
    page.tsx                      — /about-us: about page
  about/
    page.tsx                      — /about: alias, re-exports from about-us

  contact-us/
    page.tsx                      — /contact-us: contact page
  contact/
    page.tsx                      — /contact: alias, re-exports from contact-us

  privacy-policy/
    page.tsx                      — /privacy-policy: placeholder
  privacy/
    page.tsx                      — /privacy: alias, re-exports from privacy-policy

  terms-and-conditions/
    page.tsx                      — /terms-and-conditions: placeholder
  terms/
    page.tsx                      — /terms: alias, re-exports from terms-and-conditions

  shipping-policy/
    page.tsx                      — /shipping-policy: placeholder

  return-policy/
    page.tsx                      — /return-policy: placeholder

  sitemap.ts                      — /sitemap.xml: generated from backend + static routes
  robots.ts                       — /robots.txt: disallows cart/checkout/order-success/admin
```

## src/components/

Reusable components organized by domain.

### components/layout/

Components rendered in the root layout.

| File | Purpose |
| --- | --- |
| `Header.tsx` | Sticky header with brand, desktop nav, CartLink, MobileNav |
| `Footer.tsx` | Four-column footer with links and support email |
| `CartLink.tsx` | Cart button with live item count badge (client) |
| `MobileNav.tsx` | Hamburger menu for screens narrower than `md` (client) |

### components/home/

Sections used only on the homepage.

| File | Purpose |
| --- | --- |
| `HeroSection.tsx` | Full-width dark hero with first featured product image |
| `FeaturedProducts.tsx` | Horizontal row or grid of featured products |
| `CategorySection.tsx` | Grid of category cards linking to /categories/[slug] |
| `CollectionSection.tsx` | Grid of collection cards linking to /collections/[slug] |

### components/products/

Product display components used across listing and detail pages.

| File | Purpose |
| --- | --- |
| `ProductCard.tsx` | Single product card: image, name, price, stock, add-to-cart |
| `ProductGrid.tsx` | Responsive grid of ProductCard; shows EmptyState if empty |
| `ProductImageGallery.tsx` | Main image + thumbnail strip, client-side selection (client) |
| `ProductPrice.tsx` | Price, MRP strikethrough, and discount badge |
| `ProductSeoJsonLd.tsx` | Renders backend JSON-LD as `<script type="application/ld+json">` |
| `SafeProductImage.tsx` | next/image wrapper with error fallback (client) |

### components/cart/

Cart interaction components.

| File | Purpose |
| --- | --- |
| `AddToCartButton.tsx` | Posts to /api/cart/items, dispatches ees-cart-updated (client) |
| `CartItem.tsx` | Single cart row with quantity controls and remove button (client) |
| `CartSummary.tsx` | Order totals, coupon input, checkout link (client) |

### components/common/

Generic utility components with no domain dependency.

| File | Purpose |
| --- | --- |
| `Container.tsx` | Max-width centred wrapper with horizontal padding |
| `EmptyState.tsx` | Empty state with title and description |
| `ErrorState.tsx` | Error state with title and description |
| `LoadingState.tsx` | Loading indicator with optional label |
| `Pagination.tsx` | Previous/Next page links with page indicator; renders nothing when totalPages <= 1 |
| `SectionHeading.tsx` | Eyebrow, title, and description header pattern |

## src/lib/

Shared logic: API clients, TypeScript types, and utility functions.

### lib/api/

One file per domain. All files use `apiFetch` or `apiMutation` from `api-client.ts`.

| File | Exports |
| --- | --- |
| `api-client.ts` | `API_BASE_URL`, `apiFetch`, `apiMutation`, `unwrapApiResponse` |
| `products.api.ts` | `getProducts`, `getFeaturedProducts`, `searchProducts`, `getProductsByCategory`, `getProduct` |
| `categories.api.ts` | `getCategories`, `getCategory` |
| `collections.api.ts` | `getCollections`, `getCollection`, `getCollectionProducts` |
| `cart.api.ts` | `addCartItem`, `getCart`, `getCartOrNull`, `updateCartItem`, `removeCartItem`, `clearCart`, `validateCoupon` |
| `orders.api.ts` | `createOrder`, `getOrder` |
| `payments.api.ts` | `createPayment`, `verifyPayment` |
| `coupons.api.ts` | Re-exports `validateCoupon` from `cart.api.ts` |
| `seo.api.ts` | `getProductSeo`, `getCategorySeo`, `getCollectionSeo`, `getProductSchema`, `getSitemapData` |

### lib/types/

TypeScript type definitions matching backend response shapes.

| File | Types |
| --- | --- |
| `common.types.ts` | `Paginated<T>`, `ApiEnvelope<T>` |
| `product.types.ts` | `ProductImage`, `ProductCardProduct`, `ProductDetail`, `ProductQuery`, `StockStatus`, `ProductStatus` |
| `category.types.ts` | `Category` |
| `collection.types.ts` | `Collection`, `CollectionProductsResponse` |
| `cart.types.ts` | `CartItem`, `Cart`, `AddToCartInput`, `CouponValidation` |
| `order.types.ts` | `ShippingAddress`, `CreateOrderInput`, `Order`, `PaymentCreateResponse`, `PaymentVerifyResponse` |
| `seo.types.ts` | `SeoMetadata`, `SeoMetadataRecord`, `SitemapItem`, `ProductJsonLd` |

### lib/utils/

| File | Exports | Purpose |
| --- | --- | --- |
| `session-id.ts` | `getSessionId` | Generates or retrieves guest UUID from localStorage |
| `format-price.ts` | `formatPrice` | Formats a number as INR currency using Intl.NumberFormat |
| `seo.ts` | `SITE_NAME`, `SITE_URL`, `safeTitle`, `safeDescription`, `metadataFromSeo`, `absoluteUrl` | Builds Next.js Metadata from backend SEO data |

## public/

Static asset directory. No files are present at the time of documentation. Images are served through the backend upload system, not from the Next.js public folder.

## Configuration files

| File | Purpose |
| --- | --- |
| `next.config.ts` | Enables Turbopack, configures `next/image` remote patterns (localhost http, all https) |
| `tsconfig.json` | TypeScript strict mode, path alias `@/` maps to `src/` |
| `postcss.config.mjs` | Configures Tailwind CSS 4 via `@tailwindcss/postcss` |
| `eslint.config.mjs` | ESLint with `eslint-config-next` |
| `.env.example` | Template for `.env.local` with two variables |
