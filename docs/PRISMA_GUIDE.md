# Prisma Guide

## Prisma 7 Notes

The project uses Prisma 7 with PostgreSQL and the `@prisma/adapter-pg` adapter.

Important implementation details:

- `prisma/schema.prisma` does not contain a `url` field in the datasource.
- `prisma.config.ts` provides the datasource URL from `process.env["DATABASE_URL"]`.
- `PrismaService` creates `new PrismaPg({ connectionString: process.env.DATABASE_URL })`.
- `previewFeatures = ["driverAdapters"]` is still present and Prisma warns that it is deprecated because the feature is now available without the preview flag.

## PrismaService Location

Runtime Prisma client is configured in:

```text
src/database/prisma.service.ts
```

The module is:

```text
src/database/prisma.module.ts
```

## Generate Client

Run after schema changes or dependency install:

```bash
npx prisma generate
```

## Migrate in Development

```bash
npx prisma migrate dev --name migration_name
```

Example:

```bash
npx prisma migrate dev --name add_r2_image_fields
```

## Reset in Development

This drops and recreates the database schema, then runs seed if configured.

```bash
npx prisma migrate reset
```

Use only in development.

## Seed

```bash
npm run seed
```

Seed uses:

- `DATABASE_URL`
- `ADMIN_DEFAULT_EMAIL`
- `ADMIN_DEFAULT_PASSWORD`

It creates categories, collections, products, images, SEO metadata, a default admin, and `WELCOME10`.

## Validate Schema

```bash
npx prisma validate
```

## Inspect Database

Use Prisma Studio:

```bash
npx prisma studio
```

Or `psql`:

```bash
psql postgresql://ees_user:ees_password@localhost:5432/ees_backend
```

Example queries:

```sql
SELECT slug, status, "inventoryQuantity" FROM "Product";
SELECT code, type, "isActive" FROM "Coupon";
SELECT "orderNumber", "paymentStatus", "orderStatus" FROM "Order";
```

## Add a New Model Safely

1. Add the model to `prisma/schema.prisma`.
2. Add indexes and uniqueness constraints intentionally.
3. Run:

```bash
npx prisma format
npx prisma migrate dev --name add_model_name
npx prisma generate
```

4. Add service/controller tests if the model is exposed by APIs.
5. Update docs.

## Add a Nullable Field Safely

For backward-compatible schema evolution:

1. Add nullable field, for example `newField String?`.
2. Run migration:

```bash
npx prisma migrate dev --name add_new_field
```

3. Run generate:

```bash
npx prisma generate
```

4. Update DTOs and services only if the API should expose the field.

## Decimal Handling

Prisma Decimal fields should be converted before returning JSON:

```ts
price: Number(product.price)
```

This pattern is used across products, cart, orders, coupons, payments, and inventory.

## Production Migration Warning

Do not run `npx prisma migrate dev` in production. Use:

```bash
npx prisma migrate deploy
```

Run production migrations before starting the app or as a controlled release step.
