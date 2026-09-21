# API Integration

## API Base URL

Configured via the `NEXT_PUBLIC_API_BASE_URL` environment variable. Falls back to `http://localhost:8080/api` if the variable is not set.

```ts
// src/lib/api/api-client.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api';
```

All API calls prepend `API_BASE_URL` to the path, so paths in the API files do not include the base.

## Backend Response Shape

All backend responses use a standard envelope:

```json
{ "success": true, "message": "...", "data": {} }
```

Errors use:

```json
{
  "success": false,
  "message": "Human-readable error",
  "errorCode": "SCREAMING_SNAKE_CASE",
  "timestamp": "2026-05-16T00:00:00.000Z",
  "path": "/api/path"
}
```

## `unwrapApiResponse`

Checks `response.success === true`. If not, throws `new Error(response.message)`. Otherwise returns `response.data`.

```ts
export function unwrapApiResponse<T>(response: ApiEnvelope<T>): T {
  if (!response || response.success !== true) {
    throw new Error(response.message || 'API request failed');
  }
  return response.data;
}
```

## `apiFetch`

Used by Server Components for catalog data. Accepts a `revalidate` option that maps to Next.js ISR. Uses `noStore: true` to opt out of caching for mutations.

```ts
// Cached for 5 minutes
apiFetch<ProductCardProduct[]>('/public/products/featured', { revalidate: 300 })

// Not cached
apiFetch<Cart>('/cart/items', { noStore: true })
```

Content-Type is always set to `application/json`. The helper reads the response body as JSON, then calls `unwrapApiResponse` and throws on failure.

## `apiMutation`

Thin wrapper around `apiFetch` with `noStore: true` enforced. Always fetches fresh.

```ts
apiMutation<Cart>('/cart/items', {
  method: 'POST',
  body: JSON.stringify({ sessionId, productId, quantity }),
})
```

## Error Handling

- Server Component pages use `.catch(() => null)` or `.catch(() => [])` for optional data. When data is null, the page renders an `<ErrorState>` component or an empty list.
- Dynamic pages call `notFound()` when a product, category, or collection is not found.
- Client Component pages use try/catch and set a `message` state string that is displayed inline.
- `apiFetch` and `apiMutation` throw `Error` with the backend's human-readable message when `success` is false or the HTTP status is not OK.

## Public API Calls

### Products

```ts
import { getProducts, getFeaturedProducts, searchProducts, getProductsByCategory, getProduct } from '@/lib/api/products.api';

// All products with optional query params
getProducts({ page: 1, sort: 'priority' })                   // GET /public/products?page=1&sort=priority
getProducts({ search: 'rose quartz' })                       // GET /public/products?search=rose+quartz

// Featured products (homepage)
getFeaturedProducts()                                        // GET /public/products/featured

// Search
searchProducts('amethyst', 1, 20)                           // GET /public/products/search?q=amethyst&page=1&limit=20

// Products by category
getProductsByCategory('healing-crystals')                    // GET /public/products/category/healing-crystals

// Single product
getProduct('rose-quartz-bracelet')                          // GET /public/products/rose-quartz-bracelet
```

`getProducts` and `getProductsByCategory` return `Paginated<ProductCardProduct>`.
`getFeaturedProducts` returns `ProductCardProduct[]`.
`getProduct` returns `ProductDetail`.

### Categories

```ts
import { getCategories, getCategory } from '@/lib/api/categories.api';

getCategories(1, 50)        // GET /public/categories?page=1&limit=50  → Paginated<Category>
getCategory('healing-crystals') // GET /public/categories/healing-crystals → Category
```

### Collections

```ts
import { getCollections, getCollection, getCollectionProducts } from '@/lib/api/collections.api';

getCollections()                         // GET /public/collections → Collection[]
getCollection('best-sellers')            // GET /public/collections/best-sellers → Collection
getCollectionProducts('best-sellers', 1, 20) // GET /public/collections/best-sellers/products?page=1&limit=20 → CollectionProductsResponse
```

`CollectionProductsResponse` extends `Paginated<ProductCardProduct>` and adds a `collection: Collection` field.

## Cart API Calls

All cart functions are in `cart.api.ts` which is marked `'use client'`. They use `apiMutation` (no-store) or direct `fetch` with `cache: 'no-store'`.

```ts
import { addCartItem, getCart, getCartOrNull, updateCartItem, removeCartItem, clearCart, validateCoupon } from '@/lib/api/cart.api';

// Add item
addCartItem({ sessionId, productId, quantity: 1 })          // POST /cart/items

// Get cart (throws if not found)
getCart(sessionId)                                           // GET /cart/:sessionId

// Get cart (returns null on error)
getCartOrNull(sessionId)

// Update quantity
updateCartItem(itemId, 2)                                    // PATCH /cart/items/:itemId

// Remove item
removeCartItem(itemId)                                       // DELETE /cart/items/:itemId

// Clear cart
clearCart(sessionId)                                         // DELETE /cart/:sessionId/clear
```

## Coupon API Calls

```ts
import { validateCoupon, removeCoupon } from '@/lib/api/coupons.api';

validateCoupon('WELCOME10', sessionId)                      // POST /coupons/validate
removeCoupon(sessionId)                                     // DELETE /coupons/:sessionId
```

`validateCoupon` is also available directly from `cart.api.ts` (both point to the same function).

Validate request body:
```json
{ "code": "WELCOME10", "sessionId": "guest-uuid" }
```

Returns `CouponValidation`:
```ts
{
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: number;
  discountAmount: number;
  isFreeShipping: boolean;
}
```

`removeCoupon` clears the `couponCode` field on the cart and recalculates totals. Returns `{ message: string }`.

## Order API Calls

```ts
import { createOrder, getOrder } from '@/lib/api/orders.api';

createOrder({
  sessionId,
  customerName: 'Test Buyer',
  customerEmail: 'buyer@example.com',
  customerPhone: '+911234567890',
  shippingAddress: { line1, line2, city, state, pincode, country },
})                                                           // POST /orders

getOrder('ORD-20260516-000001')                             // GET /orders/:orderNumber
```

`createOrder` returns `Order`. `getOrder` returns `Order`.

## Payment API Calls

```ts
import { createPayment, verifyPayment } from '@/lib/api/payments.api';

createPayment('ORD-20260516-000001')                        // POST /payments/create
// Returns PaymentCreateResponse including providerPaymentId (the mock payment ID)

verifyPayment('ORD-20260516-000001', 'mock_pay_xxx')        // POST /payments/verify
// Returns PaymentVerifyResponse
```

The checkout page passes `payment.providerPaymentId` directly to `verifyPayment`. The mock gateway always generates a `providerPaymentId`.

## SEO API Calls

```ts
import { getProductSeo, getCategorySeo, getCollectionSeo, getProductSchema, getSitemapData } from '@/lib/api/seo.api';

getProductSeo('rose-quartz-bracelet')      // GET /public/seo/product/:slug → SeoMetadata
getCategorySeo('healing-crystals')         // GET /public/seo/category/:slug → SeoMetadata
getCollectionSeo('best-sellers')           // GET /public/seo/collection/:slug → SeoMetadata
getProductSchema('rose-quartz-bracelet')   // GET /public/seo/product-schema/:slug → ProductJsonLd
getSitemapData()                           // GET /public/sitemap-data → SitemapItem[]
```

`SeoMetadata` shape:
```ts
{
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  openGraph?: { title?: string; description?: string; image?: string };
  twitter?: { title?: string; description?: string; image?: string };
}
```

`ProductJsonLd` is `Record<string, unknown>`. The raw JSON-LD object from the backend is serialized and injected into a `<script>` tag without modification.

## Contact API Calls

```ts
import { submitContactLead } from '@/lib/api/contact.api';

submitContactLead({
  name: 'Sunil',
  email: 'sunil@example.com',
  phone: '9999999999',       // optional
  subject: 'Product question', // optional
  message: 'I want to know more about rose quartz bracelet.',
})                                                             // POST /public/contact → ContactLeadResponse
```

`submitContactLead` is marked `'use client'` and uses `apiMutation` (no-store). It returns a `ContactLeadResponse`:

```ts
{
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED' | 'SPAM';
  createdAt: string;
  updatedAt: string;
}
```

The `ContactForm` component handles success and error display. On success the form is cleared and a confirmation message is shown. On failure the backend's human-readable message is displayed inline.

## Known Integration Assumptions

1. The backend always returns the standard `{ success, message, data }` envelope. A response without this shape causes `unwrapApiResponse` to throw.
2. `getCart` throws if the cart session does not exist yet. `getCartOrNull` wraps this in a try/catch and returns null for first-time visitors.
3. The checkout flow assumes `payment.providerPaymentId` is always present after `createPayment`. If it is null or undefined, checkout throws "Payment could not be created".
4. `getCollections()` returns `Collection[]` (not paginated). The backend endpoint for collections is not paginated.
