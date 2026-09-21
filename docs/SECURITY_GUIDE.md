# Security Guide

## Root/Admin Security Assumptions

The backend assumes admin users are trusted staff. Admin APIs can modify catalog, SEO, coupons, order status, inventory, and uploads.

Production admin access should be limited to secure networks, strong passwords, and least-privilege roles.

## JWT Admin Auth

Admin login returns a JWT:

```text
POST /api/admin/auth/login
```

Protected routes use:

```http
Authorization: Bearer <accessToken>
```

`JwtStrategy` validates the token and checks that the admin user still exists and is active.

## Role Guard

`RolesGuard` reads `@Roles(...)` metadata on admin routes.

Roles:

- `SUPER_ADMIN`
- `ADMIN`
- `EDITOR`

Mutating APIs use stricter roles than read APIs.

## CORS Whitelist

`main.ts` reads `CORS_ORIGIN`, splits by comma, and allows only configured origins. Requests without an origin, such as server-to-server or curl, are allowed.

Production should set:

```env
CORS_ORIGIN=https://your-frontend-domain.com
```

## Helmet

Helmet is enabled globally in `main.ts` to set secure HTTP headers.

## Rate Limiting

`ThrottlerModule` is configured globally:

- ttl: 60 seconds
- limit: 120 requests

Login route has stricter throttle:

- ttl: 60 seconds
- limit: 5 requests

## ValidationPipe

Global validation uses:

- `whitelist: true`
- `transform: true`
- `forbidNonWhitelisted: true`

DTOs validate strings, emails, phone formats, numbers, enums, dates, arrays, and nested shipping address data.

## Global Exception Filter

Errors are returned in a stable envelope and raw stack traces are not returned by the filter.

Format:

```json
{
  "success": false,
  "message": "Error message",
  "errorCode": "ERROR_CODE",
  "timestamp": "2026-05-16T00:00:00.000Z",
  "path": "/api/path"
}
```

## Password Hashing

Admin passwords are hashed with bcrypt:

- seed uses bcrypt hash with cost 12
- e2e helper uses lower cost for speed
- login verifies with bcrypt compare

`passwordHash` is never returned by login or profile responses.

## Upload Security

Upload controls:

- JWT required
- role guard required
- allowed MIME types: JPEG, PNG, WebP
- size limit from `MAX_UPLOAD_SIZE_MB`
- Sharp validates image content
- unsafe original filenames are not used
- generated filenames use UUIDs
- local filesystem paths are not returned
- R2 credentials are not returned

## Payment Idempotency

Payment verification is idempotent:

- already paid orders return success without reprocessing
- confirmation work runs in a transaction
- inventory decrement is protected from double reduction

## Environment Secret Handling

Do not commit:

- `.env`
- JWT secrets
- database passwords
- R2 access keys
- payment gateway secrets when added

Use strong production values and rotate them when needed.

## Production Checklist

- Set strong `JWT_SECRET`.
- Set production `CORS_ORIGIN`.
- Use managed PostgreSQL with backups.
- Use R2 or object storage for uploads.
- Use HTTPS only.
- Run `npx prisma migrate deploy`.
- Seed or create admin securely, then rotate initial password.
- Add structured logs and monitoring.
- Add real payment webhook verification before accepting live payments.
