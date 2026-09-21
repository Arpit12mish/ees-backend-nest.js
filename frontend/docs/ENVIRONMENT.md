# Environment Variables

The frontend uses two environment variables. Both are `NEXT_PUBLIC_` prefixed, which means they are embedded into the client bundle at build time and accessible in the browser.

## Variables

### `NEXT_PUBLIC_API_BASE_URL`

The base URL for the backend API, including the `/api` prefix.

Used in `src/lib/api/api-client.ts`:
```ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api';
```

All API calls are made to `${API_BASE_URL}/path`.

### `NEXT_PUBLIC_SITE_URL`

The origin of the frontend website. Used for:
- Canonical URL generation in `metadataFromSeo`
- Sitemap URL prefix
- Robots.txt sitemap pointer
- `metadataBase` in root layout

Used in `src/lib/utils/seo.ts`:
```ts
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
```

## Local Development

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Do not commit `.env.local`. It is listed in `.gitignore`.

`.env.example` contains the same values and is safe to commit.

## Production (Vercel)

Set these variables in the Vercel project dashboard under Settings > Environment Variables.

```
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

Replace `api.yourdomain.com` with the actual domain or subdomain where the backend is deployed. Replace `yourdomain.com` with the production frontend domain.

## Common Mistakes

### Missing `/api` suffix

Wrong:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Right:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Without the suffix, all API paths will 404 because the backend mounts all routes under `/api`.

### Trailing slash

Wrong:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/
```

The api-client builds paths like `${API_BASE_URL}/public/products`, which would produce a double slash. Remove the trailing slash.

### SITE_URL with trailing slash

Wrong:
```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com/
```

Canonical URLs would have a double slash before the path segment.

### SITE_URL mismatch with backend FRONTEND_BASE_URL

The backend uses `FRONTEND_BASE_URL` to build canonical URLs in SEO metadata. If `NEXT_PUBLIC_SITE_URL` does not match `FRONTEND_BASE_URL`, canonical URLs stored in the backend will differ from the ones the frontend generates as fallbacks.

### Using production URL in development

If `NEXT_PUBLIC_API_BASE_URL` points to the production backend during local development, all local cart and checkout tests will create real orders against the production database.

## What Not to Expose

Do not add sensitive values to `NEXT_PUBLIC_` variables. These are embedded into the browser bundle:
- No API keys
- No database connection strings
- No JWT secrets
- No admin credentials
- No payment gateway secrets

All sensitive configuration belongs in the backend `.env` file, not the frontend.

## Relationship with Backend CORS

The backend allows cross-origin requests from origins listed in its `CORS_ORIGIN` environment variable. When the frontend is deployed to a new domain, add that domain to `CORS_ORIGIN` in the backend environment, otherwise the browser will block all API requests.

Example backend CORS setting:
```
CORS_ORIGIN=https://yourdomain.com
```

For local development where both run on localhost, CORS is typically permissive.
