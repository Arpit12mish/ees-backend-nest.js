# Uploads and Images

## Current Upload System

The upload module supports:

- local development storage
- Cloudflare R2 using S3-compatible API
- Sharp image optimization
- WebP output
- product-ready image variants

## Upload Endpoint

```text
POST /api/admin/uploads/image
```

Auth:

- JWT required
- roles: `SUPER_ADMIN`, `ADMIN`, `EDITOR`

Request:

- `multipart/form-data`
- file field name: `file`

## Validation

Allowed MIME types:

- `image/jpeg`
- `image/png`
- `image/webp`

Size limit:

- `MAX_UPLOAD_SIZE_MB`
- default: `5`

Missing file returns `IMAGE_FILE_REQUIRED`.

Invalid MIME or unreadable image returns `INVALID_IMAGE_TYPE`.

Oversized file returns `IMAGE_TOO_LARGE`.

## Image Optimization

For each upload, Sharp generates:

| Variant | Width | Notes |
| --- | --- | --- |
| thumbnail | 300 | Product thumbnails. |
| card | 600 | Product cards and listing pages. |
| detail | 1200 | Product detail main image. |
| original | 1600 max | Optimized original-sized WebP. |

Rules:

- output format is WebP
- quality is around 80
- aspect ratio is preserved
- small images are not upscaled
- filenames use UUIDs, not original filenames

Key pattern:

```text
products/yyyy/mm/<uuid>-thumb.webp
products/yyyy/mm/<uuid>-card.webp
products/yyyy/mm/<uuid>-detail.webp
products/yyyy/mm/<uuid>-original.webp
```

## Local Upload Behavior

When `UPLOAD_DRIVER=local`, files are written under:

```text
uploads/products/yyyy/mm/
```

Public URLs are:

```text
/uploads/products/yyyy/mm/<file>.webp
```

Local static files are served from `/uploads` with long static caching.

## Cloudflare R2 Behavior

When `UPLOAD_DRIVER=r2`, objects are uploaded through the S3-compatible R2 API.

Required env:

```env
UPLOAD_DRIVER=r2
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=ees-product-images
R2_PUBLIC_BASE_URL=https://images.yourdomain.com
R2_REGION=auto
```

The provider:

- does not use public ACLs
- uploads with `Content-Type: image/webp`
- uploads with `Cache-Control: public, max-age=31536000, immutable`
- creates public URLs from `R2_PUBLIC_BASE_URL`
- never returns credentials

## Upload Response Shape

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "provider": "r2",
    "storageKey": "products/2026/05/uuid-detail.webp",
    "originalUrl": "https://images.yourdomain.com/products/2026/05/uuid-original.webp",
    "thumbnailUrl": "https://images.yourdomain.com/products/2026/05/uuid-thumb.webp",
    "cardUrl": "https://images.yourdomain.com/products/2026/05/uuid-card.webp",
    "detailUrl": "https://images.yourdomain.com/products/2026/05/uuid-detail.webp",
    "width": 1200,
    "height": 1200,
    "mimeType": "image/webp",
    "size": 123456
  }
}
```

## ProductImage Usage

Uploads do not automatically attach images to products. After upload, call:

```text
POST /api/admin/products/:productId/images
```

Example payload:

```json
{
  "imageUrl": "https://images.yourdomain.com/products/2026/05/uuid-detail.webp",
  "thumbnailUrl": "https://images.yourdomain.com/products/2026/05/uuid-thumb.webp",
  "cardUrl": "https://images.yourdomain.com/products/2026/05/uuid-card.webp",
  "detailUrl": "https://images.yourdomain.com/products/2026/05/uuid-detail.webp",
  "storageKey": "products/2026/05/uuid-detail.webp",
  "storageProvider": "r2",
  "mimeType": "image/webp",
  "sizeBytes": 123456,
  "altText": "Rose quartz bracelet with natural pink crystal beads",
  "width": 1200,
  "height": 1200,
  "isPrimary": true
}
```

## Public Product Image Data

Public product APIs return image fields:

- `imageUrl`
- `thumbnailUrl`
- `cardUrl`
- `detailUrl`
- `altText`
- `title`
- `width`
- `height`
- `isPrimary`

Fallback behavior:

- thumbnail falls back to `imageUrl`
- card falls back to `imageUrl`
- detail falls back to `imageUrl`

## Image Alt Text Rules

Alt text is required when creating a product image through admin APIs.

Good alt text:

```text
Amethyst crystal point on a white background
```

Avoid:

```text
Guaranteed healing amethyst cure crystal
```

## Replacement Strategy

Do not overwrite old image keys. Upload a new image and save the new keys on the product image record. Long immutable caching is safe because filenames are unique.

If an urgent replacement is needed, manually purge the old object URL in Cloudflare.
