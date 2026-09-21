# Energy Essentials Backend

## Overview

Energy Essentials Backend is a NestJS modular monolith for a healing stone and crystal e-commerce website. It exposes public catalog, SEO, cart, order, payment, coupon, upload, and protected admin APIs backed by PostgreSQL and Prisma 7.

The backend is API-only. It does not include a frontend or admin panel UI.

## Business Context

The store sells crystals, natural stones, pyramids, bracelets, candles, cleansing products, positivity products, love products, prosperity products, protection products, and related energy products.

All product and SEO copy must avoid medical claims and guaranteed spiritual outcomes. Use wording such as:

- traditionally associated with
- believed to support
- commonly used for
- often chosen for
- symbolizes

## Tech Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js, NestJS, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Validation | `class-validator`, `class-transformer` |
| Auth | JWT admin auth, Passport JWT |
| Security | Helmet, CORS whitelist, Throttler, global validation pipe |
| Responses | Global response interceptor and exception filter |
| Uploads | Local storage and Cloudflare R2-compatible storage |
| Images | Sharp WebP optimization |
| Payments | Mock payment gateway abstraction |
| Tests | Jest, Supertest e2e tests |

## Features Implemented

- Health check with database connectivity
- Public category, product, collection, SEO, JSON-LD, and sitemap-data APIs
- Cart APIs with coupon support
- Order creation with price snapshots
- Mock payment creation and idempotent verification
- Inventory decrement only after successful payment
- Admin login and profile APIs
- Admin catalog, SEO, coupon, order, inventory, and upload APIs
- Product image variants for thumbnail, card, detail, and optimized original
- Public cache headers for catalog/SEO APIs and no-store headers for private APIs
- Seed data for categories, collections, products, SEO metadata, admin user, and sample coupon

## Folder Structure

```text
src/
  common/      shared constants, filters, interceptors, middleware, utilities
  config/      app, database, and env validation config
  database/    Prisma module and PrismaService
  modules/     feature modules grouped by public, commerce, admin, and uploads
prisma/
  schema.prisma
  migrations/
  seed.ts
test/
  Jest e2e specs and helpers
uploads/
  local development image objects
docs/
  backend documentation
```

See [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) for the full breakdown.

## Environment Setup

Copy the example env file and fill in local values:

```bash
cp .env.example .env
```

Minimum local variables:

```env
DATABASE_URL=postgresql://ees_user:ees_password@localhost:5432/ees_backend
PORT=8080
NODE_ENV=development
FRONTEND_BASE_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
ADMIN_DEFAULT_EMAIL=admin@example.com
ADMIN_DEFAULT_PASSWORD=Admin@123456
UPLOAD_DRIVER=local
MAX_UPLOAD_SIZE_MB=5
BODY_LIMIT=1mb
```

For every variable, see [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md).

## Database Setup

Install PostgreSQL locally or run it with Docker, then create a database and user:

```bash
createdb ees_backend
```

Or with `psql`:

```sql
CREATE USER ees_user WITH PASSWORD 'ees_password';
CREATE DATABASE ees_backend OWNER ees_user;
GRANT ALL PRIVILEGES ON DATABASE ees_backend TO ees_user;
```

More setup options and troubleshooting are in [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md).

## Prisma Setup

Prisma 7 uses `prisma.config.ts` for the datasource URL and `PrismaService` uses the `PrismaPg` adapter.

```bash
npx prisma generate
npx prisma migrate dev
npx prisma validate
```

Development reset:

```bash
npx prisma migrate reset
```

See [docs/PRISMA_GUIDE.md](docs/PRISMA_GUIDE.md).

## Running Locally

Install dependencies:

```bash
npm install
```

Run migrations:

```bash
npx prisma migrate dev
```

Seed data:

```bash
npm run seed
```

Start development server:

```bash
npm run start:dev
```

The API base URL is:

```text
http://localhost:8080/api
```

## Health Check

```bash
curl http://localhost:8080/api/health
```

Expected shape:

```json
{
  "success": true,
  "message": "Backend is running",
  "data": {
    "status": "ok",
    "database": "connected"
  }
}
```

## Admin Login

The seed creates a default SUPER_ADMIN using:

- `ADMIN_DEFAULT_EMAIL`
- `ADMIN_DEFAULT_PASSWORD`

Login:

```bash
curl -X POST http://localhost:8080/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123456"}'
```

## API Overview

All normal API responses use:

```json
{ "success": true, "message": "Success message", "data": {} }
```

Errors use:

```json
{
  "success": false,
  "message": "Error message",
  "errorCode": "ERROR_CODE",
  "timestamp": "2026-05-16T00:00:00.000Z",
  "path": "/api/path"
}
```

Full endpoint documentation is in [docs/API_ENDPOINTS.md](docs/API_ENDPOINTS.md).

## Testing

```bash
npm test
npm run test:e2e
npm run lint
npm run build
npx prisma validate
```

The e2e suite uses Supertest and a dedicated PostgreSQL schema when configured by the test setup.

## Build

```bash
npm run build
npm run start:prod
```

Production start uses:

```bash
node dist/src/main
```

## Documentation Index

- [Architecture](docs/ARCHITECTURE.md)
- [Folder Structure](docs/FOLDER_STRUCTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Endpoints](docs/API_ENDPOINTS.md)
- [API Flow Examples](docs/API_FLOW_EXAMPLES.md)
- [Environment](docs/ENVIRONMENT.md)
- [Local Setup](docs/LOCAL_SETUP.md)
- [Prisma Guide](docs/PRISMA_GUIDE.md)
- [SEO Backend Guide](docs/SEO_BACKEND_GUIDE.md)
- [Order Payment Flow](docs/ORDER_PAYMENT_FLOW.md)
- [Admin Backend Guide](docs/ADMIN_BACKEND_GUIDE.md)
- [Uploads and Images](docs/UPLOADS_AND_IMAGES.md)
- [Caching Strategy](docs/CACHING_STRATEGY.md)
- [Security Guide](docs/SECURITY_GUIDE.md)
- [Testing Guide](docs/TESTING_GUIDE.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## Current Limitations

- Payments use a mock gateway. Real gateway webhooks are planned.
- No frontend or admin UI is included.
- Redis is not used yet.
- Product reviews, leads, FAQ, CMS pages, shipping-zone models, and homepage models are not present in the current Prisma schema.
- Coupon usage is counted during order creation, not during payment confirmation.
- `DEFAULT_SHIPPING_AMOUNT` is not an environment variable in the current code. Shipping constants are currently hardcoded in cart and order services.

## Future Improvements

- Real payment gateway integration with webhook verification
- Redis-backed cache and rate limit store
- Structured logging and monitoring
- Admin audit logs beyond order status history
- Dedicated shipping configuration model
- Review, FAQ, lead, and CMS page modules

## Production Notes

- Use a strong `JWT_SECRET`.
- Never commit `.env`.
- Use production-safe PostgreSQL credentials.
- Use Cloudflare R2 or another object storage provider for production image storage.
- Run migrations with a deployment-safe workflow, not `migrate dev`.
- Configure `CORS_ORIGIN` for the real frontend domain.
