# Deployment Guide

## Target Platform

The frontend is designed for deployment on Vercel. It can also run on any platform that supports Node.js with `next start`.

## Prerequisites

- Backend is deployed and publicly accessible at a stable HTTPS URL.
- Backend CORS is configured to allow the frontend domain.
- Vercel account and CLI or GitHub integration configured.

## Vercel Deployment Steps

### 1. Set Environment Variables

In the Vercel project dashboard, go to Settings > Environment Variables.

Add:

| Variable | Production value |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.yourdomain.com/api` |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |

Replace `api.yourdomain.com` and `yourdomain.com` with actual production domains.

These variables are embedded into the client bundle at build time. After changing them, trigger a new deployment.

### 2. Configure Backend CORS

In the backend production environment, add the frontend domain to `CORS_ORIGIN`:

```
CORS_ORIGIN=https://yourdomain.com
```

Without this, the browser will block all API requests from the frontend with a CORS error.

### 3. Deploy via Vercel CLI

```bash
cd frontend
npx vercel --prod
```

Or connect the repository to Vercel via the dashboard for automatic deployments on push.

### 4. Build Command

Vercel auto-detects Next.js. The build command is:

```
next build --webpack
```

The `--webpack` flag is specified in `package.json`. Remove it if switching to Turbopack for production builds.

### 5. Output Directory

Next.js App Router uses `.next/`. Vercel auto-detects this; no manual configuration needed.

## Domain Setup

1. In the Vercel project, go to Settings > Domains.
2. Add your production domain (e.g., `yourdomain.com`).
3. Update DNS records as instructed by Vercel (A or CNAME records).
4. Wait for DNS propagation and SSL certificate issuance (usually under 10 minutes on Vercel).

## next/image Domain Configuration

`next.config.ts` currently allows images from any HTTPS domain:

```ts
remotePatterns: [
  { protocol: 'http', hostname: 'localhost' },
  { protocol: 'https', hostname: '**' },
],
```

The wildcard `https://**` is kept because the backend's R2 hostname is configured via `R2_PUBLIC_BASE_URL` at deploy time and is not known at frontend build time. A comment in `next.config.ts` documents this.

Once your image hostname is known, restrict it for production security. Replace `https://**` with:

```ts
remotePatterns: [
  { protocol: 'https', hostname: 'pub-abc123.r2.dev' },
  // or your custom CDN domain:
  // { protocol: 'https', hostname: 'images.yourdomain.com' },
],
```

This prevents the `next/image` optimization endpoint from being used as a proxy for arbitrary external images.

## Sitemap Production Behavior

The sitemap at `/sitemap.xml` fetches live data from the backend during each ISR revalidation (every 3600 seconds). For the sitemap to include product, category, and collection URLs:

- The backend must be reachable from the Vercel build/runtime environment.
- `NEXT_PUBLIC_API_BASE_URL` must point to the backend that has published products and active categories/collections.
- `NEXT_PUBLIC_SITE_URL` must match the production frontend URL used by the backend's `FRONTEND_BASE_URL` env var.

## Robots Production Behavior

`/robots.txt` uses `NEXT_PUBLIC_SITE_URL` for the sitemap URL. Ensure this points to the production frontend domain.

## Post-Deployment Checklist

- [ ] `https://yourdomain.com/api/health` — backend health (from a browser, to verify CORS)
- [ ] `https://yourdomain.com/products` — products load
- [ ] `https://yourdomain.com/products/[any-product-slug]` — product detail loads with metadata
- [ ] View page source for a product page — confirm `<meta>` tags and `<script type="application/ld+json">` are present
- [ ] `https://yourdomain.com/sitemap.xml` — includes product and category URLs
- [ ] `https://yourdomain.com/robots.txt` — lists correct sitemap URL and disallowed paths
- [ ] Add a product to cart, proceed to checkout, complete mock payment — confirm redirect to `/order-success`
- [ ] Test on a real mobile device (iOS Safari, Android Chrome)
- [ ] Run Lighthouse audit on the homepage (target: Performance > 80, SEO = 100)

## Environment Variable Changes

After changing `NEXT_PUBLIC_API_BASE_URL` or `NEXT_PUBLIC_SITE_URL`:
1. Trigger a new Vercel deployment (these variables are baked in at build time).
2. The previous deployment uses the old values until traffic is cut over.

## Rollback

Vercel keeps previous deployments. To roll back:
1. Go to the Vercel project dashboard > Deployments.
2. Find the previous successful deployment.
3. Click the three-dot menu > Promote to Production.

## Self-Hosted Deployment

If not using Vercel:

```bash
npm run build
npm run start          # starts on port 3000
```

Use a reverse proxy (Nginx, Caddy) to expose port 3000 with TLS. Set environment variables before the build, not just before `npm run start`, because `NEXT_PUBLIC_` variables are embedded at build time.

Example with PM2:
```bash
export NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
export NEXT_PUBLIC_SITE_URL=https://yourdomain.com
npm run build
pm2 start npm --name "ees-frontend" -- start
```
