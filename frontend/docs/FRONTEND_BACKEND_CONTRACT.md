# Frontend–Backend Contract

This document defines the dependency between each frontend route and its backend APIs, the required response fields, and what backend changes would break the frontend.

## Route to API Mapping

| Frontend route | Backend APIs used |
| --- | --- |
| `/` | GET /public/products/featured, GET /public/categories, GET /public/collections |
| `/products` | GET /public/products, GET /public/products/search |
| `/products/[slug]` | GET /public/products/:slug, GET /public/seo/product/:slug, GET /public/seo/product-schema/:slug |
| `/categories` | GET /public/categories |
| `/categories/[slug]` | GET /public/categories/:slug, GET /public/products/category/:slug, GET /public/seo/category/:slug |
| `/collections` | GET /public/collections |
| `/collections/[slug]` | GET /public/collections/:slug/products, GET /public/seo/collection/:slug |
| `/cart` | GET /cart/:sessionId, PATCH /cart/items/:itemId, DELETE /cart/items/:itemId, POST /coupons/validate |
| `/checkout` | GET /cart/:sessionId, POST /coupons/validate, POST /orders, POST /payments/create, POST /payments/verify |
| `/order-success` | None (reads URL query param only) |
| `/contact-us` | POST /public/contact |
| `/sitemap.xml` | GET /public/sitemap-data |

## Required Backend Response Fields

### Product (list and detail)

These fields must be present on every product in the response. Omitting them causes rendering issues.

```ts
{
  id: string;         // used as key and in AddToCartButton
  name: string;       // displayed as product title
  slug: string;       // used to build /products/[slug] links
  price: number;      // displayed by ProductPrice
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'; // controls button state
  images: ProductImage[];     // array can be empty, but must be present
  primaryImage?: ProductImage | null;  // used for card and gallery
}
```

Optional but rendered when present:
- `mrp`, `discountPercent` — shown as strikethrough price and discount badge
- `shortDescription` — shown on detail page
- `storySummary`, `spiritualBenefitSummary`, `usageGuide`, `careInstructions`, `longDescription` — content sections on detail page
- `category.name`, `category.slug` — category label and link on cards
- `attributes` — shown as attribute list on detail page

### Product Image Fields

```ts
{
  imageUrl: string;        // fallback, always present if image exists
  thumbnailUrl?: string;   // 300px variant
  cardUrl?: string;        // 600px variant
  detailUrl?: string;      // 1200px variant
  altText?: string;        // accessibility
  isPrimary?: boolean;     // used to identify primaryImage
}
```

If all variant fields are null and `imageUrl` is empty or null, the `SafeProductImage` placeholder is shown.

### Paginated Response

```ts
{
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

`items` must be an array. `meta` must be present. If the shape changes, the frontend will crash trying to read `.items`.

### Collection Products Response

Must include a `collection` field in addition to the paginated structure:

```ts
{
  collection: Collection;
  items: ProductCardProduct[];
  meta: { total, page, limit, totalPages };
}
```

If `collection` is missing, the collection detail page header will not render.

### Cart Response

```ts
{
  id: string;
  sessionId: string;
  couponCode?: string | null;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  grandTotal: number;
  itemCount: number;
}
```

`CartLink` reads `itemCount`. `CartSummary` reads `subtotal`, `discountAmount`, `shippingAmount`, `grandTotal`, `couponCode`. `CartPage` reads `items`.

### SEO Metadata Response

```ts
{
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  openGraph?: { title?, description?, image? };
  twitter?: { title?, description?, image? };
}
```

If the backend returns a shape without `title` or `description`, `metadataFromSeo` uses fallback values, so the page does not crash but metadata is less accurate.

### Payment Create Response

```ts
{
  orderNumber: string;
  providerPaymentId?: string;  // REQUIRED: passed to verify
  status: string;
  amount: number;
  currency: string;
  message: string;
}
```

If `providerPaymentId` is null or undefined, the checkout throws "Payment could not be created" and the user cannot complete checkout.

### Payment Verify Response

```ts
{
  orderNumber: string;
  paymentStatus: string;
  orderStatus: string;
  amount: number;
  message: string;
}
```

The frontend reads this only to confirm success. If the call succeeds without error, it redirects to `/order-success`.

### Sitemap Data Response

```ts
SitemapItem[]

// Each item:
{
  url: string;
  lastModified: string;
  changeFrequency: string;
  priority: number;
  type: string;
}
```

`url` must be an absolute URL (backend uses `FRONTEND_BASE_URL`). `lastModified` must be a parseable date string. `changeFrequency` must match Next.js's allowed values: `always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`, `never`.

## What Backend Changes Would Break the Frontend

### Breaking changes

| Change | Effect |
| --- | --- |
| Remove `items` from paginated response | Pages crash trying to read `.items` |
| Remove `collection` from collection products response | Collection detail header does not render |
| Remove `itemCount` from cart response | CartLink shows 0 even when items exist |
| Change `/public/products/featured` to a paginated response | Homepage tries to `.map()` a non-array, crashes |
| Remove `providerPaymentId` from payment create response | Checkout always fails |
| Change API path prefix from `/api` | All API calls fail with 404 |
| Change response envelope from `{ success, message, data }` | `unwrapApiResponse` throws on every response |
| Return non-JSON content type on any endpoint | `readApiEnvelope` returns an error envelope |

### Non-breaking changes

| Change | Effect |
| --- | --- |
| Add new optional fields to product response | Frontend ignores unknown fields |
| Add new product content fields (e.g., a new detail section) | Frontend does not display them unless the component is updated |
| Change SEO field defaults in the backend | `metadataFromSeo` uses the provided value or its own fallback |
| Add new image variant fields | Frontend uses only the four known fields; new ones are ignored |
| Change shipping threshold or shipping amount | Frontend displays whatever the backend returns |
| Add pagination to collections endpoint | Frontend currently expects `Collection[]`. This would break if the shape changes to `Paginated<Collection>` |

## How to Safely Update the Contract

1. Add new fields as optional in the backend before the frontend uses them.
2. Add the field to the frontend TypeScript type and read it in the component.
3. Deploy the backend first, then the frontend.
4. Never remove or rename a field that the frontend reads without updating both sides simultaneously.
5. If changing a response shape significantly, add a new endpoint (versioned path) and migrate the frontend before removing the old endpoint.

## Known Integration Notes

### Footer Search Links

The footer's "Categories" section links to `/products?search=crystal`, `/products?search=bracelet`, etc. These are product search links, not category page links. They pass the keyword to the product search endpoint (`GET /api/public/products/search?q=`), not the category endpoint. This is intentional but may not match user expectations if they interpret the "Categories" heading as navigation to category pages.

### Contact Form

The `/contact-us` page submits to `POST /api/public/contact`. The backend stores the submission as a `ContactLead` with status `NEW`. The required fields are `name`, `email`, and `message`; `phone` and `subject` are optional.

Required response fields from the backend:
```ts
{
  id: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED' | 'SPAM';
  createdAt: string;
  updatedAt: string;
}
```

If the backend returns a validation error (400), the error message is displayed inline below the form. If the backend is unavailable, the user sees a generic retry message.
