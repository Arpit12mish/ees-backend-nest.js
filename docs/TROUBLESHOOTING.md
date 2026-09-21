# Troubleshooting

## Missing `DATABASE_URL`

Error:

```text
Missing required environment variables: DATABASE_URL
```

Fix:

```bash
cp .env.example .env
```

Add:

```env
DATABASE_URL=postgresql://ees_user:ees_password@localhost:5432/ees_backend
```

## `.env` Exists but Nest Cannot Read It

`ConfigModule` loads `.env` from the project root.

Check:

```bash
pwd
ls -la .env
```

Run commands from the backend root.

## `env.validation.ts` Checking `process.env`

The current validator reads both the config object and `process.env`. This was important because Prisma/Nest config loading can supply values through either path. If validation fails, check both `.env` content and current shell environment.

## Prisma P1010 Access Denied

Cause: PostgreSQL user does not have permission.

Fix:

```sql
CREATE USER ees_user WITH PASSWORD 'ees_password';
CREATE DATABASE ees_backend OWNER ees_user;
GRANT ALL PRIVILEGES ON DATABASE ees_backend TO ees_user;
```

Then:

```bash
npx prisma migrate dev
```

## Need to Create PostgreSQL User and Database

Homebrew quick setup:

```bash
brew services start postgresql@16
createuser ees_user
createdb ees_backend -O ees_user
psql postgres
```

Inside `psql`:

```sql
ALTER USER ees_user WITH PASSWORD 'ees_password';
```

## `psql` Does Not Accept `?schema=public`

Some `psql` flows do not accept Prisma-style URL query parameters. Use:

```bash
psql postgresql://ees_user:ees_password@localhost:5432/ees_backend
```

Keep `?schema=public` out of manual `psql` commands unless your client supports it.

## Docker CLI Installed but Docker Desktop Daemon Not Running

Check:

```bash
docker ps
```

If it fails, start Docker Desktop.

## Unable to Find Docker App

Install Docker Desktop or use Homebrew PostgreSQL. Docker CLI alone is not enough if the daemon is missing.

## Prisma `driverAdapters` Preview Warning

Warning:

```text
Preview feature "driverAdapters" is deprecated.
```

The current schema still includes:

```prisma
previewFeatures = ["driverAdapters"]
```

Prisma 7 supports this without a preview flag. The warning does not currently block build, tests, migrations, or validation. Remove the preview flag in a separate code-maintenance change if desired.

## Upload Width/Height Null or Metadata Missing

The current upload flow uses Sharp and returns width/height for generated WebP detail images. If width/height are missing in product image records, the image was likely created manually through the admin product image API without using upload output.

Fix by saving `width` and `height` from upload response when creating the product image.

## Invalid Upload Type

Allowed:

- JPEG
- PNG
- WebP

GIF and SVG are not accepted by the upload service.

## R2 Upload Driver Not Configured

If `UPLOAD_DRIVER=r2`, these are required:

```env
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=
```

Do not return or log secret keys.

## Port Conflicts

If API port `8080` is in use:

```env
PORT=8081
```

If PostgreSQL port `5432` is in use, use another port for Docker:

```bash
docker run ... -p 5433:5432 ...
```

Then:

```env
DATABASE_URL=postgresql://ees_user:ees_password@localhost:5433/ees_backend
```

## Database Not Connected

Run:

```bash
npx prisma validate
npx prisma migrate dev
curl http://localhost:8080/api/health
```

If health fails, verify PostgreSQL is running and credentials are correct.

## Seed Failing

Check:

- database exists
- migrations ran
- `DATABASE_URL` is valid
- user has write privileges
- no duplicate unique values beyond intended upserts

Run:

```bash
npm run seed
```

## Admin Login Issues

Fix steps:

1. Confirm seed ran.
2. Confirm `ADMIN_DEFAULT_EMAIL`.
3. Confirm `ADMIN_DEFAULT_PASSWORD`.
4. Ensure admin is active in database.
5. Try login again.

Query:

```sql
SELECT email, role, "isActive" FROM "AdminUser";
```

## Public Product Not Visible

Check:

- product `status` is `PUBLISHED`
- category `isActive` is true
- product slug matches URL
- inventory can be out of stock and still visible, but cannot be added to cart

## Product Cannot Be Added to Cart

Possible reasons:

- product is not `PUBLISHED`
- product is `OUT_OF_STOCK`
- requested quantity exceeds `inventoryQuantity`
- request quantity is less than 1
