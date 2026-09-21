# Local Setup

## Prerequisites

- Node.js 20+ (required by Next.js 16)
- npm 10+
- The backend must be running and accessible before the frontend can load catalog data

## Start the Backend First

The frontend fetches all catalog data from the backend. Without the backend running, product pages will show error states and the sitemap will return only static routes.

From the backend root (`eesBackend/`):

```bash
npm install
npx prisma generate
npm run seed           # creates categories, collections, products, and default admin
npm run start:dev      # starts on port 8080
```

Verify the backend is healthy:
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{ "success": true, "message": "Backend is running", "data": { "status": "ok", "database": "connected" } }
```

## Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Configure Environment

```bash
cp .env.example .env.local
```

`.env.local` contents for local development:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

These values are the defaults used by the code, so the frontend will work even without the file. The file is needed for production overrides.

## Start the Frontend

```bash
npm run dev
```

The development server starts on `http://localhost:3000`.

## Verify Local Setup

### Backend health
```bash
curl http://localhost:8080/api/health
```

### Product listing
Open `http://localhost:3000/products` — should show seeded products.

### Product detail
Click any product card — should open a detail page with image gallery and add-to-cart button.

### Categories
Open `http://localhost:3000/categories` — should show seeded categories.

### Cart
Click "Add to cart" on any in-stock product. Open `http://localhost:3000/cart` — item should appear.

### Checkout
Fill in the checkout form and click "Confirm Mock Payment". Should redirect to `/order-success`.

### Contact form
Open `http://localhost:3000/contact-us` — fill in name, email, and message, then click "Send Message". A success confirmation should appear. Verify the lead was created by calling `GET http://localhost:8080/api/admin/contact-leads` with a valid admin token.

### Sitemap
Open `http://localhost:3000/sitemap.xml` — should list backend product, category, and collection URLs.

## Build

```bash
npm run build
```

Compiles TypeScript, generates static pages, and fetches sitemap data from the backend. Requires the backend to be running.

## Start Production Build

```bash
npm run build
npm run start
```

Starts the production server on port 3000.

## Lint

```bash
npm run lint
```

Runs ESLint with the Next.js config. Reports style and type errors.

## Typecheck

```bash
npm run typecheck
```

Runs `tsc --noEmit`. Reports TypeScript type errors without producing output files.

## Common Local Issues

### Products not loading

Symptom: `/products` shows the error state "Products could not be loaded."

Cause: Backend is not running or `NEXT_PUBLIC_API_BASE_URL` is wrong.

Fix:
1. Start the backend (`npm run start:dev` from `eesBackend/`).
2. Verify `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api` in `.env.local`.

### Cart not loading

Symptom: Cart page is blank or shows no items after adding a product.

Cause: Session ID may be empty (SSR environment) or the backend cart endpoint is unavailable.

Fix:
1. Open browser DevTools > Application > Local Storage. Confirm `ees_guest_session_id` is set.
2. Reload the cart page in the browser (not Next.js cache).

### Images not showing

Symptom: Product cards show "Image coming soon" placeholder.

Cause: No images were uploaded to products, or image URLs point to a backend that is not running.

Fix: Use the admin API to upload images to products, or use the seed data which may not include images.

### Build fails with fetch errors

Symptom: `npm run build` errors during sitemap or page generation.

Cause: The build process fetches live data from the backend (ISR pre-rendering). The backend must be running during build.

Fix: Start the backend before running `npm run build`.

### TypeScript errors

```bash
npm run typecheck
```

Fix errors before building. Common causes: changed backend response shapes that are not yet reflected in `lib/types/`.

### Port conflict

If port 3000 is in use:
```bash
PORT=3001 npm run dev
```

Update `NEXT_PUBLIC_SITE_URL=http://localhost:3001` accordingly.
