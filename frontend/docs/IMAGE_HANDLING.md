# Image Handling

## SafeProductImage Component

`src/components/products/SafeProductImage.tsx` is a wrapper around `next/image` that handles missing URLs and broken images.

```tsx
<SafeProductImage
  src={imageUrl}
  alt="Product name"
  sizes="(max-width: 640px) 100vw, 50vw"
  priority={true}
/>
```

Behavior:
- If `src` is null, undefined, or empty: renders a grey placeholder div with "Image coming soon".
- If `src` is a valid URL: renders `next/image` with `fill` layout.
- If the image fails to load (`onError`): sets `available` to false and shows the placeholder div.

The `fill` layout requires a positioned parent container. All usage sites wrap `SafeProductImage` in a `relative` container with an explicit aspect ratio or height.

## next/image Configuration

`next.config.ts` allows images from:
- `http://localhost` — for local backend uploads
- `https://**` — for all HTTPS domains (Cloudflare R2, CDNs, etc.)

```ts
images: {
  remotePatterns: [
    { protocol: 'http', hostname: 'localhost' },
    { protocol: 'https', hostname: '**' },
  ],
},
```

The `https://**` wildcard is intentionally kept because the backend's image hostname is set at deployment time via `R2_PUBLIC_BASE_URL` and is not known at frontend build time. A comment in `next.config.ts` explains this.

**Production hardening:** Once your R2 bucket domain or CDN hostname is known, replace `https://**` with the specific hostname to prevent the Next.js image optimizer endpoint from acting as an open proxy. Example:

```ts
{ protocol: 'https', hostname: 'pub-abc123.r2.dev' }
// or for a custom CDN domain:
{ protocol: 'https', hostname: 'images.yourdomain.com' }
```

## Product Image Fields

The backend provides four size variants per image:

| Field | Backend generated width | Use case |
| --- | --- | --- |
| `thumbnailUrl` | 300px | Thumbnail strip, cart item image |
| `cardUrl` | 600px | Product card, list pages |
| `detailUrl` | 1200px | Product detail gallery, hero section |
| `imageUrl` | 1600px (original) | Fallback when variants are not available |

All four fields are optional on the `ProductImage` type. The priority chain is used to always pick the best available variant.

## Image Priority by Usage

### Product Cards (`ProductCard.tsx`)

```
primaryImage.cardUrl
  → primaryImage.thumbnailUrl
    → primaryImage.imageUrl
      → images[0].cardUrl
        → images[0].thumbnailUrl
          → images[0].imageUrl
            → null (shows placeholder)
```

Function:
```ts
function cardImage(product: ProductCardProduct) {
  const image = product.primaryImage ?? product.images?.[0];
  return image?.cardUrl ?? image?.thumbnailUrl ?? image?.imageUrl ?? null;
}
```

`sizes` attribute: `"(max-width: 359px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"`

### Product Detail Gallery (`ProductImageGallery.tsx`)

Main image (selected):
```
image.detailUrl → image.cardUrl → image.imageUrl → null
```

Thumbnail strip:
```
image.thumbnailUrl → image.cardUrl → image.imageUrl
```

`sizes` attribute for main image: `"(max-width: 768px) 100vw, 50vw"`
`sizes` attribute for thumbnails: `"72px"`

The gallery marks the main image with `priority` so it loads without waiting for JavaScript.

### Hero Section (`HeroSection.tsx`)

Uses the first featured product image:
```
primaryImage.detailUrl
  → primaryImage.cardUrl
    → primaryImage.imageUrl
      → images[0].detailUrl
        → images[0].cardUrl
          → images[0].imageUrl
            → null (no background image)
```

`sizes`: `"100vw"` because the hero spans the full viewport width.

The hero image has `priority` set so it is the LCP (Largest Contentful Paint) candidate.

### Cart Item Image (`CartItem.tsx`)

```
primaryImage.thumbnailUrl
  → primaryImage.cardUrl
    → primaryImage.imageUrl
      → images[0].thumbnailUrl
        → images[0].imageUrl
          → null (no image rendered)
```

`sizes`: `"112px"` — fixed small size in the cart row.

## Layout Shift Prevention

All image containers use one of these patterns:

```tsx
// Fixed aspect ratio — prevents layout shift
<div className="relative aspect-square">
  <SafeProductImage src={src} alt={alt} sizes="..." />
</div>

// Fixed pixel size in cart
<div className="relative aspect-square overflow-hidden rounded-md" style={{ width: 112, height: 112 }}>
  <Image src={src} alt={alt} fill sizes="112px" />
</div>
```

The `fill` layout on `next/image` fills the parent container. The parent's `aspect-square` class (1:1 ratio) or explicit dimensions define the height, preventing any layout shift.

## R2 and External Image URLs

When `UPLOAD_DRIVER=r2` is set in the backend, image URLs are absolute HTTPS URLs like:
```
https://pub-abc.r2.dev/products/2026/05/uuid-card.webp
```

When `UPLOAD_DRIVER=local`, image URLs are relative paths:
```
/uploads/products/2026/05/uuid-card.webp
```

The frontend stores full image URLs returned by the backend in `ProductImage.imageUrl`, `thumbnailUrl`, `cardUrl`, and `detailUrl`. For local storage, the URL is relative and must be combined with the backend base URL. The backend returns the full URL in the upload response, so the frontend stores whatever URL the admin provided when adding the image.

If images are stored locally and the backend base URL changes (for example from localhost to a production domain), all stored image URLs will break. This is expected behavior for local storage; use R2 for production.

## Alt Text

- Admin-provided `altText` field on `ProductImage` is preferred.
- Falls back to `product.name` or `productName` prop.
- `SafeProductImage` requires an `alt` prop and always passes it to `next/image`.
- Empty alt text is never used — this would hide images from screen readers and fail accessibility audits.
