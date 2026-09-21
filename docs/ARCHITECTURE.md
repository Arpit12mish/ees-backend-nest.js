# Architecture

## System Shape

This backend is a modular monolith built with NestJS. Each business area is isolated into a Nest module, but everything runs in one deployable Node.js process and shares one PostgreSQL database.

This is the right shape for the current MVP because the domain is still changing, team overhead is low, and the application does not yet need distributed services, Redis, queues, or separate deployable workers.

## Why NestJS, PostgreSQL, and Prisma

| Choice | Reason |
| --- | --- |
| NestJS | Gives modules, guards, interceptors, filters, validation, and testing structure. |
| PostgreSQL | Strong relational fit for catalog, cart, order, payment, coupon, and SEO data. |
| Prisma 7 | Type-safe database access, migrations, seed workflow, and decimal support. |
| `@prisma/adapter-pg` | Prisma 7 adapter pattern used by `PrismaService` with PostgreSQL. |

## Request Lifecycle

1. HTTP request enters `main.ts`.
2. Helmet, static uploads, cache-control middleware, JSON/body parsers, compression, and CORS are applied.
3. Global prefix `api` maps routes under `/api`.
4. `ValidationPipe` validates DTOs and strips unknown fields.
5. Guards run where configured, mainly JWT and roles on admin routes.
6. Controller delegates to service.
7. Service uses `PrismaService` for database work.
8. `ResponseInterceptor` wraps normal responses when the controller did not already return the envelope.
9. `GlobalExceptionFilter` converts exceptions into the standard error envelope.

## Public API Flow

Public catalog and SEO APIs are read-only:

- Categories return only `isActive = true`.
- Products return only `status = PUBLISHED` and active category products.
- Collections return only `isActive = true`.
- Collection product lists filter products to published products in active categories.
- SEO and sitemap endpoints also filter to public active/published entities.

Public controllers use `@Res()` in several places to set cache headers manually and return the response envelope directly.

## Admin API Flow

Admin routes live under `/api/admin/*`.

1. Admin logs in with `POST /api/admin/auth/login`.
2. Password is checked with bcrypt.
3. JWT contains `sub`, `email`, `name`, and `role`.
4. Protected admin routes use `JwtAuthGuard`.
5. Mutating routes use `RolesGuard` and `@Roles(...)`.
6. Admin services enforce uniqueness, soft deletion, status changes, and inventory rules.

`/api/admin/auth/login` is the only admin route that is intentionally public.

## Cart, Order, and Payment Flow

1. Customer adds a published, in-stock product to cart.
2. Cart stores `sessionId`, cart items, quantity, and `priceAtAdd`.
3. Coupon validation can attach `couponCode` to the cart.
4. Order creation reads cart items, validates stock and product status, calculates subtotal, discount, shipping, and grand total.
5. Order items store a price and product snapshot.
6. Mock payment creation creates a `Payment` row in `PENDING`.
7. Mock payment verification confirms the payment inside a Prisma transaction.
8. On success, order becomes `CONFIRMED`, payment becomes `SUCCESS`, inventory decrements once, stock status recalculates, and the cart is cleared.

The payment verify path is idempotent. If the order is already paid, it returns success without decrementing inventory again.

## Upload Flow

1. Admin uploads an image with `POST /api/admin/uploads/image`.
2. JWT and role checks are required.
3. Upload service validates file presence, MIME type, and size.
4. Sharp generates WebP variants:
   - thumbnail: width 300
   - card: width 600
   - detail: width 1200
   - original: max width 1600
5. Storage provider is selected by `UPLOAD_DRIVER`.
6. Local storage writes to `uploads/products/yyyy/mm/...`.
7. R2 storage uses the S3-compatible Cloudflare R2 API and returns URLs using `R2_PUBLIC_BASE_URL`.
8. Product images are linked separately through admin product image APIs.

## SEO and Sitemap Flow

SEO metadata is stored in `SeoMetadata` by entity type and entity id.

- Product SEO falls back to product name, short description, canonical product URL, and product image.
- Category SEO falls back to category fields.
- Collection SEO falls back to collection fields.
- Product JSON-LD includes Product, brand, SKU, image, offer, price, currency, availability, and URL.
- Sitemap data is generated from published products, active categories, and active collections using `FRONTEND_BASE_URL`.

## Response Interceptor Flow

`ResponseInterceptor` checks controller return values:

- If the object already has `success`, it is returned as-is.
- Otherwise it wraps the payload as `{ success: true, message, data }`.

Controllers using `@Res()` manually return the same response envelope.

## Global Exception Filter Flow

`GlobalExceptionFilter` catches all thrown exceptions and returns:

```json
{
  "success": false,
  "message": "Error message",
  "errorCode": "ERROR_CODE",
  "timestamp": "2026-05-16T00:00:00.000Z",
  "path": "/api/path"
}
```

Known `HttpException` responses can include custom `message` and `errorCode`. Unknown errors become `INTERNAL_SERVER_ERROR`.

## Security Layers

- Helmet middleware
- CORS origin whitelist from `CORS_ORIGIN`
- JSON/body size limit from `BODY_LIMIT`
- Global `ValidationPipe` with whitelist and forbidden unknown fields
- Throttler module with global 120 requests per minute limit
- Login route throttle: 5 requests per minute
- JWT admin auth
- Role-based guards for admin mutations
- bcrypt password hashing
- No `passwordHash` in auth responses
- Upload MIME and size validation
- Payment verification idempotency

## Caching Strategy

Public catalog and SEO APIs return public cache headers. Admin, cart, order, payment, coupon, auth, and upload routes are marked `Cache-Control: no-store`.

Image objects use long immutable cache because filenames are unique. If an image changes, generate a new object key instead of overwriting the old key.

See [CACHING_STRATEGY.md](CACHING_STRATEGY.md).

## Why Redis and Microservices Are Not Used Yet

Redis is not needed for the MVP because cache headers can be handled at the HTTP/CDN layer and rate limiting is currently in-process. Microservices are also unnecessary because the domain is cohesive, transaction boundaries are local, and operational complexity would increase before the product needs it.

Planned future uses for Redis include shared rate limiting, short-lived server-side cache, queue locks, and background jobs.
