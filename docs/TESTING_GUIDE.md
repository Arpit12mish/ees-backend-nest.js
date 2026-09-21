# Testing Guide

## Commands

Unit tests:

```bash
npm test
```

E2E tests:

```bash
npm run test:e2e
```

Lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

Prisma validation:

```bash
npx prisma validate
```

## Current Test Structure

```text
test/
  app.e2e-spec.ts
  health.e2e-spec.ts
  public-catalog.e2e-spec.ts
  seo.e2e-spec.ts
  admin-auth.e2e-spec.ts
  admin-catalog.e2e-spec.ts
  cart-order-payment.e2e-spec.ts
  coupons.e2e-spec.ts
  inventory.e2e-spec.ts
  uploads.e2e-spec.ts
```

Unit specs currently include:

```text
src/common/utils/pagination.util.spec.ts
src/modules/uploads/uploads.service.spec.ts
```

## E2E Test Coverage

The e2e suite covers:

- health
- public categories/products/collections
- public SEO, JSON-LD, sitemap data
- admin auth
- admin catalog creation and publishing
- cart operations
- order creation
- mock payment creation and idempotent verification
- coupon validation
- admin order lifecycle
- inventory updates
- upload validation and successful upload
- error envelope checks

## Manual Curl Tests

Health:

```bash
curl http://localhost:8080/api/health
```

Admin login:

```bash
curl -X POST http://localhost:8080/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123456"}'
```

Product listing:

```bash
curl http://localhost:8080/api/public/products
```

Cart add:

```bash
curl -X POST http://localhost:8080/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"manual-test","productId":"product_cuid","quantity":1}'
```

Upload:

```bash
curl -X POST http://localhost:8080/api/admin/uploads/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/product.jpg"
```

## Common Test Failures

### E2E Cannot Connect to Database

Check `DATABASE_URL`, local PostgreSQL, and permissions.

```bash
psql "$DATABASE_URL"
```

### Prisma Migrations Not Applied

Run:

```bash
npx prisma migrate dev
```

### Admin Login Test Fails

The test suite seeds its own admin. For manual testing, run:

```bash
npm run seed
```

### Upload Test Fails

Check:

- `UPLOAD_DRIVER=local` for local tests
- `MAX_UPLOAD_SIZE_MB`
- file is valid JPEG, PNG, or WebP
- admin token is present

### Lint Changes Files

The lint script runs ESLint with `--fix`, so it may modify TypeScript formatting/imports.

## Recommended Next Testing Improvements

- Add focused unit tests for coupon edge cases.
- Add tests for R2 provider with mocked S3 client.
- Add tests for admin role denial by role.
- Add tests for cancelled order SUPER_ADMIN override behavior.
- Add load-friendly smoke tests for public cache headers.
