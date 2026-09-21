# Deployment Guide

## Recommended Architecture

```text
Next.js frontend
  -> CDN / Cloudflare
  -> NestJS API
  -> PostgreSQL
  -> Cloudflare R2 for images
```

The frontend is separate and should call the backend APIs under `/api`.

## Backend Hosting Options

Practical options:

- Render
- Railway
- Fly.io
- AWS ECS/Fargate
- Google Cloud Run
- DigitalOcean App Platform
- A VPS with systemd or Docker

Requirements:

- Node.js compatible runtime
- ability to set environment variables
- network access to PostgreSQL
- persistent local disk only if using local uploads, which is not recommended for production

## PostgreSQL Hosting Options

Recommended:

- Neon
- Supabase
- Render PostgreSQL
- Railway PostgreSQL
- AWS RDS
- Google Cloud SQL

Enable backups and avoid using a privileged superuser for the app.

## Image Storage Options

Implemented:

- local development storage
- Cloudflare R2 via S3-compatible API

Recommended production:

- Cloudflare R2 bucket
- custom public domain, for example `https://images.yourdomain.com`
- long immutable cache headers

## Production Environment Checklist

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
PORT=8080
FRONTEND_BASE_URL=https://www.yourdomain.com
CORS_ORIGIN=https://www.yourdomain.com
JWT_SECRET=<strong-secret>
JWT_EXPIRES_IN=1d
ADMIN_DEFAULT_EMAIL=<admin-email>
ADMIN_DEFAULT_PASSWORD=<temporary-strong-password>
UPLOAD_DRIVER=r2
MAX_UPLOAD_SIZE_MB=5
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<r2-access-key>
R2_SECRET_ACCESS_KEY=<r2-secret-key>
R2_BUCKET=ees-product-images
R2_PUBLIC_BASE_URL=https://images.yourdomain.com
R2_REGION=auto
BODY_LIMIT=1mb
```

## Build

```bash
npm ci
npx prisma generate
npm run build
```

## Migrations

Use deploy migrations in production:

```bash
npx prisma migrate deploy
```

Do not use `migrate dev` in production.

## Seed

Seed can create the initial admin and sample catalog data:

```bash
npm run seed
```

For production, consider a controlled admin creation process and rotate the initial password after setup.

## Start

```bash
npm run start:prod
```

This runs:

```bash
node dist/src/main
```

## Health Check After Deployment

```bash
curl https://api.yourdomain.com/api/health
```

Expected:

```json
{
  "success": true,
  "message": "Backend is running",
  "data": { "status": "ok", "database": "connected" }
}
```

## CORS Production Setup

Set `CORS_ORIGIN` to the exact frontend domain:

```env
CORS_ORIGIN=https://www.yourdomain.com
```

For multiple domains:

```env
CORS_ORIGIN=https://www.yourdomain.com,https://yourdomain.com
```

## Upload Storage Production Notes

Use R2 in production. Local uploads are not safe for most hosted environments because files may disappear on redeploy or not be shared across instances.

R2 objects use long immutable caching. Upload replacements should create new keys.

## Logging and Monitoring Future Notes

Recommended additions:

- structured JSON logs
- request ID middleware
- error tracking, for example Sentry
- uptime checks on `/api/health`
- database metrics
- payment webhook audit logs when real payments are added
