# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev          # Watch mode (ts-node via NestJS CLI)
npm run build              # Compile to dist/
node dist/src/main         # Run production build (note: dist/src/main, not dist/main)

# Database
npx prisma migrate dev --name <migration-name>   # Create and apply migration
npx prisma migrate deploy                        # Apply migrations (production)
npx prisma generate                              # Regenerate Prisma client after schema changes
npm run seed                                     # Seed all categories, collections, products + default admin

# Code quality
npm run lint               # ESLint with auto-fix
npm run format             # Prettier
npx tsc --noEmit           # Type-check without building
```

## Architecture

**Modular monolith** — each domain is a self-contained NestJS module under `src/modules/`. All modules register in `src/app.module.ts`. `PrismaModule` is `@Global()`, so `PrismaService` is available everywhere without re-importing.

**Module layout:**
- `src/modules/` — public-facing APIs (categories, products, collections, seo, cart, orders, payments, coupons)
- `src/modules/admin/` — admin APIs, each mirroring a public domain (categories, products, collections, seo, coupons, orders, inventory)
- `src/modules/auth/` — JWT strategy, guards, decorators; imported once by `AppModule`; admin controllers reference guards directly without re-importing `AuthModule`
- `src/modules/uploads/` — image upload with multi-variant WebP conversion via `sharp`

**Strict layer separation:**
- Controller → HTTP only; returns `{ success, message, data }`
- Service → all business logic and DB access via `PrismaService`
- DTO → input validation with class-validator

**Prisma 7 specifics:**
- The schema has no `url` in the `datasource` block — the connection string is read by `prisma.config.ts` (for CLI) and by `PrismaPg` adapter (for the runtime client).
- `PrismaService` constructs `PrismaClient` using `@prisma/adapter-pg` (`PrismaPg`). Changing the constructor requires reading `DATABASE_URL` from `process.env` at construction time.
- After any `schema.prisma` change, run `npx prisma generate` before building.
- `driverAdapters` preview feature is enabled in the generator.

**Response envelope** — all endpoints return:
```json
{ "success": true, "message": "...", "data": {} }
```
Errors (via `GlobalExceptionFilter`):
```json
{ "success": false, "message": "...", "errorCode": "...", "timestamp": "...", "path": "..." }
```
Throw errors from services as `new NotFoundException({ message: '...', errorCode: 'SCREAMING_SNAKE' })`.

**Pagination** — use `getPaginationParams()` + `paginate()` from `src/common/utils/pagination.util.ts`. Max limit is capped at 100.

**Cache headers** — controllers that use `@Res() res: Response` set headers via `res.setHeader('Cache-Control', CACHE_HEADERS.X)` from `src/common/constants/cache.constants.ts`. Using `@Res()` bypasses NestJS interceptors, so the response must be sent manually with `return res.json(...)`.

**Decimal fields** — Prisma returns `Decimal` objects for `price`, `mrp`, `discountPercent`, coupon `value`, etc. Always convert with `Number(x)` before returning from services.

**`import type` for `Response`** — controllers that inject `@Res() res: Response` must use `import type { Response } from 'express'` (not a value import) to satisfy `isolatedModules` + `emitDecoratorMetadata`.

## Admin authentication

All admin controllers use `@UseGuards(JwtAuthGuard, RolesGuard)` at the class level. Write endpoints add `@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)`. `EDITOR` role can read and update content but cannot create/delete. Inject the current admin via `@CurrentAdmin() admin: AdminPayload`.

Login: `POST /api/admin/auth/login` (rate-limited to 5 req/60s). Token is a standard Bearer JWT.

## Domain flow: cart → order → payment

1. **Cart** (`/api/cart`) — session-based (no auth). `addItem` validates stock and deduplicates. Totals are computed on read via `getCart()`. Free shipping above ₹499; otherwise ₹49. Coupon code stored on the Cart row; `CouponsService.computeDiscount()` is called inline to compute `discountAmount` and `isFreeShipping`.
2. **Coupons** (`/api/coupons`) — `POST /validate` looks up the code, runs `validateCouponForAmount`, writes `couponCode` onto the Cart, and returns the discount preview. `CouponsService` is exported and shared by `CartModule` and `OrdersModule`.
3. **Order** (`/api/orders`) — `createOrder` re-reads the cart's `couponCode`, recomputes the discount, snapshots product name/sku/price into `OrderItem`, and increments `coupon.usedCount`. Generates order numbers like `ORD-YYYYMMDD-000001`.
4. **Payment** (`/api/payments`) — uses `MockPaymentGateway` (implements `PaymentGateway` interface in `gateways/`). `verifyPayment` is idempotent: returns success immediately if already paid. On first verification, runs a Prisma transaction that confirms the order, decrements inventory using each product's own `lowStockThreshold`, and clears the cart.

## Uploads module

`POST /api/admin/uploads/image` (JWT-protected, multipart/form-data, field name `file`). Accepts JPEG/PNG/WebP up to `MAX_UPLOAD_SIZE_MB`. Uses `sharp` to generate four WebP variants: `thumbnail` (300px), `card` (600px), `detail` (1200px), `original` (1600px). Returns URLs for all variants.

Storage driver is selected by `UPLOAD_DRIVER` env var:
- `local` — files saved under `uploads/` and served as static files from `/uploads`
- `r2` — uploaded to Cloudflare R2 via S3-compatible API (`R2StorageProvider`)
- `s3` — uploaded to AWS S3 via `@aws-sdk/client-s3` (`AwsS3StorageProvider`). Public URL defaults to `https://<bucket>.s3.<region>.amazonaws.com/<key>`; set `AWS_S3_PUBLIC_BASE_URL` to serve through a CloudFront/custom domain instead.

All three drivers implement `StorageProvider` interface (`uploadObject`, `deleteObject`, `getPublicUrl`).

## Admin inventory

`GET /api/admin/inventory` — all products with stock fields. `GET /api/admin/inventory/low-stock` — only `LOW_STOCK` and `OUT_OF_STOCK`. `PATCH /api/admin/inventory/:productId` — set `inventoryQuantity` + `lowStockThreshold`; `stockStatus` is recomputed automatically.

## Admin order lifecycle

Status transitions are strictly validated via `ALLOWED_TRANSITIONS` map. `SHIPPED`/`DELIVERED` require `paymentStatus=SUCCESS`. `CANCELLED` orders can only be modified by `SUPER_ADMIN`. Every transition writes an `OrderStatusHistory` row with `oldStatus`, `newStatus`, `note`, and `changedByAdminId`.

## SEO module

`SeoService` serves entity types (`PRODUCT`, `CATEGORY`, `COLLECTION`, `HOME`) from the `SeoMetadata` table. Falls back to product/category/collection fields if no row exists. `SeoController` uses an empty `@Controller()` prefix with full paths like `@Get('public/seo/product/:slug')` — intentional to coexist with the `/api` global prefix.

## Env validation

`validateEnv` in `src/config/env.validation.ts` runs at startup (via `ConfigModule.validate`). `DATABASE_URL` is always required. In production, `JWT_SECRET`, `ADMIN_DEFAULT_EMAIL`, `ADMIN_DEFAULT_PASSWORD` are also required. If `UPLOAD_DRIVER=r2`, all R2 credentials are required. If `UPLOAD_DRIVER=s3`, `AWS_S3_REGION`, `AWS_S3_ACCESS_KEY_ID`, `AWS_S3_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` are required (`AWS_S3_PUBLIC_BASE_URL` is optional).

## Content rules

All product descriptions use safe spiritual wording: "traditionally associated with", "believed to support", "commonly used for", "often chosen for", "symbolizes". Never use guaranteed outcome language ("will bring", "cures", "heals").

## Environment variables

See `.env.example` for the full list. Key variables:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/eesbackend
PORT=8080
JWT_SECRET=replace-with-a-long-random-secret
UPLOAD_DRIVER=local          # or r2, s3
BACKEND_BASE_URL=http://localhost:8080
FRONTEND_BASE_URL=http://localhost:3000
```
