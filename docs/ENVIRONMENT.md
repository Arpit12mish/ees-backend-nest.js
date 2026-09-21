# Environment Variables

Values are read through `ConfigModule`, `app.config.ts`, `database.config.ts`, `env.validation.ts`, `prisma.config.ts`, Prisma seed, and upload providers.

Never commit `.env`.

## Variables

| Variable | Required | Example | Used by | Notes |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Yes | `postgresql://ees_user:ees_password@localhost:5432/ees_backend` | Prisma config, PrismaService, seed, tests | Required in all environments. Prisma 7 reads it from `prisma.config.ts`; runtime uses `PrismaPg`. |
| `PORT` | No | `8080` | `main.ts`, `app.config.ts` | Defaults to `8080`. |
| `NODE_ENV` | No | `development` | `env.validation.ts` | When `production`, auth env values are required. |
| `FRONTEND_BASE_URL` | No | `http://localhost:3000` | SEO service, sitemap URLs | Used for canonical URLs and sitemap data. |
| `BACKEND_BASE_URL` | No | `http://localhost:8080` | `app.config.ts` | Configured but not heavily used by current services. |
| `CORS_ORIGIN` | No | `http://localhost:3000` | `main.ts` | Comma-separated origin whitelist. |
| `JWT_SECRET` | Required in production | `replace-with-a-long-random-secret` | Auth module JWT signing/verification | Use a strong secret in production. |
| `JWT_EXPIRES_IN` | No | `1d` | Auth module | Defaults to `1d`. |
| `ADMIN_DEFAULT_EMAIL` | Required in production | `admin@example.com` | Seed file, app config | Seed creates or updates default admin. |
| `ADMIN_DEFAULT_PASSWORD` | Required in production | `Admin@123456` | Seed file, app config | Seed hashes this with bcrypt. Use a strong production password and rotate after first login. |
| `UPLOAD_DRIVER` | No | `local` or `r2` | Uploads service, env validation | Defaults to `local`. If `r2`, R2 variables below are required. |
| `MAX_UPLOAD_SIZE_MB` | No | `5` | Uploads service | Defaults to 5 MB. |
| `BODY_LIMIT` | No | `1mb` | `main.ts` | JSON and URL-encoded body parser limit. |
| `R2_ACCOUNT_ID` | No | `account-id` | App config | Captured for config completeness. Not required by code when endpoint is supplied. |
| `R2_ENDPOINT` | Required when `UPLOAD_DRIVER=r2` | `https://<account-id>.r2.cloudflarestorage.com` | R2 storage provider | S3-compatible endpoint. |
| `R2_ACCESS_KEY_ID` | Required when `UPLOAD_DRIVER=r2` | `xxxx` | R2 storage provider | Do not expose in API responses. |
| `R2_SECRET_ACCESS_KEY` | Required when `UPLOAD_DRIVER=r2` | `xxxx` | R2 storage provider | Secret. Never commit. |
| `R2_BUCKET` | Required when `UPLOAD_DRIVER=r2` | `ees-product-images` | R2 storage provider | Bucket name. |
| `R2_PUBLIC_BASE_URL` | Required when `UPLOAD_DRIVER=r2` | `https://images.yourdomain.com` | R2 storage provider | Public CDN/custom-domain base URL. |
| `R2_REGION` | No | `auto` | R2 storage provider | Defaults to `auto`. |
| `DEFAULT_SHIPPING_AMOUNT` | Not implemented | `49` | Planned/Future | Requested by docs context, but current code hardcodes shipping as `49` in cart and order services. |

## Local Development Example

```env
DATABASE_URL=postgresql://ees_user:ees_password@localhost:5432/ees_backend
PORT=8080
NODE_ENV=development
FRONTEND_BASE_URL=http://localhost:3000
BACKEND_BASE_URL=http://localhost:8080
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
ADMIN_DEFAULT_EMAIL=admin@example.com
ADMIN_DEFAULT_PASSWORD=Admin@123456
UPLOAD_DRIVER=local
MAX_UPLOAD_SIZE_MB=5
BODY_LIMIT=1mb
```

## Cloudflare R2 Production Example

```env
UPLOAD_DRIVER=r2
MAX_UPLOAD_SIZE_MB=5
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<r2-access-key>
R2_SECRET_ACCESS_KEY=<r2-secret-key>
R2_BUCKET=ees-product-images
R2_PUBLIC_BASE_URL=https://images.yourdomain.com
R2_REGION=auto
```

## Production Notes

- Use least-privilege R2 credentials. Do not use root AWS credentials.
- Use a strong `JWT_SECRET`.
- Keep `CORS_ORIGIN` restricted to the production frontend domain.
- Keep `.env` out of git.
- Rotate `ADMIN_DEFAULT_PASSWORD` after the initial seed/admin setup.
