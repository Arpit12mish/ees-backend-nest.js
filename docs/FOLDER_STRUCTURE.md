# Folder Structure

## Root

```text
.
├── src/
├── prisma/
├── test/
├── uploads/
├── docs/
├── frontend/           ← Next.js customer-facing website (see frontend/README.md)
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── .env.example
```

## `src/`

Application source code.

```text
src/
├── app.module.ts
├── main.ts
├── common/
├── config/
├── database/
└── modules/
```

### `src/main.ts`

Bootstraps NestJS and configures:

- Helmet
- Static local uploads from `/uploads`
- Private API no-store cache middleware
- JSON and URL-encoded body limits
- Compression
- CORS whitelist
- Global `/api` prefix
- Global validation pipe
- Global exception filter
- Global response interceptor

### `src/app.module.ts`

Imports all app modules and global configuration:

- `ConfigModule`
- `ThrottlerModule`
- `PrismaModule`
- Public modules
- Commerce modules
- Admin modules
- Uploads module

## `src/common/`

Shared cross-cutting code.

| Path | Purpose |
| --- | --- |
| `constants/cache.constants.ts` | Public, image, sitemap, and no-store cache header values. |
| `filters/global-exception.filter.ts` | Standard error response format. |
| `interceptors/response.interceptor.ts` | Standard success response format. |
| `middleware/cache-control.middleware.ts` | Adds `no-store` to private/dynamic API routes. |
| `utils/pagination.util.ts` | Pagination helpers. |
| `utils/slug.util.ts` | Slug generation helper. |

## `src/config/`

| File | Purpose |
| --- | --- |
| `app.config.ts` | Reads port, frontend URL, CORS, JWT, upload, R2, and body limit config. |
| `database.config.ts` | Exposes `DATABASE_URL`. |
| `env.validation.ts` | Requires `DATABASE_URL`, production auth env, and R2 env when `UPLOAD_DRIVER=r2`. |

## `src/database/`

| File | Purpose |
| --- | --- |
| `prisma.module.ts` | Provides PrismaService globally to modules. |
| `prisma.service.ts` | Extends PrismaClient and uses `PrismaPg` adapter with `DATABASE_URL`. |

## `src/modules/`

Feature modules.

| Module | Purpose |
| --- | --- |
| `health` | Database-backed health check. |
| `categories` | Public active category APIs. |
| `products` | Public published product APIs. |
| `collections` | Public active collection APIs. |
| `seo` | Public SEO metadata, JSON-LD, and sitemap-data APIs. |
| `cart` | Guest/session cart APIs. |
| `orders` | Public order creation and lookup by order number. |
| `payments` | Mock payment creation, verification, and status APIs. |
| `coupons` | Public coupon validation and coupon removal from cart. |
| `auth` | Admin login, JWT strategy, guards, decorators. |
| `admin/categories` | Protected category management APIs. |
| `admin/products` | Protected product and product image management APIs. |
| `admin/collections` | Protected collection and collection product APIs. |
| `admin/seo` | Protected SEO metadata management APIs. |
| `admin/coupons` | Protected coupon management APIs. |
| `admin/orders` | Protected order lifecycle APIs. |
| `admin/inventory` | Protected stock management APIs. |
| `uploads` | Protected image upload and storage providers. |

## `prisma/`

| Path | Purpose |
| --- | --- |
| `schema.prisma` | Database schema and enums. |
| `migrations/` | Prisma migration files. |
| `seed.ts` | Seeds categories, collections, products, SEO metadata, admin user, and coupon. |

## `test/`

Jest e2e test suite and helpers.

| File | Purpose |
| --- | --- |
| `*.e2e-spec.ts` | Supertest API flow tests. |
| `e2e-utils.ts` | App bootstrap, DB reset, admin login, and seed helpers. |
| `e2e-global-setup.js` | Test database/schema setup and migration. |
| `jest-e2e.json` | E2E Jest config. |

## `uploads/`

Local development upload storage. Production should use R2 or another object store. Local objects are served under `/uploads` with long static cache headers.

## `docs/`

Project documentation. Start with [../README.md](../README.md), then use the topic-specific files in this folder.
