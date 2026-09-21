# Troubleshooting

## Backend API Unavailable

Symptom: Product pages show "Products could not be loaded." or error states. Cart is empty. Homepage shows no products.

Diagnosis:
```bash
curl http://localhost:8080/api/health
```

Fix:
1. Start the backend: `npm run start:dev` from `eesBackend/`.
2. Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`.
3. Confirm the backend database is connected (check backend logs).

---

## NEXT_PUBLIC_API_BASE_URL Wrong

Symptom: All API calls fail with network errors or 404s in the browser console.

Diagnosis: Open browser DevTools > Network tab. Look at the request URLs. If they show `undefined/public/products` or `http://localhost:3000/public/products`, the variable is not set.

Fix:
- Ensure `.env.local` exists with `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api`.
- Restart `npm run dev` after editing `.env.local` (Next.js reads env at startup).
- Do not use a trailing slash.

---

## CORS Error

Symptom: Browser console shows `Access to fetch ... has been blocked by CORS policy`.

Diagnosis: The backend is not allowing requests from the frontend's origin.

Fix:
1. Check the backend's `CORS_ORIGIN` environment variable — it must include the frontend origin exactly.
2. For local development: `CORS_ORIGIN=http://localhost:3000`
3. For production: `CORS_ORIGIN=https://yourdomain.com`
4. Restart the backend after changing CORS settings.

---

## Product Images Not Loading

Symptom: Product cards and detail pages show "Image coming soon" placeholder.

Possible causes:
1. No images were uploaded to products via the admin API.
2. Image URLs point to the backend's local storage (`/uploads/...`) but the backend URL has changed.
3. The image file no longer exists in the backend's `uploads/` folder.

Fix:
1. Upload images via `POST /api/admin/uploads/image` and link them to the product via `POST /api/admin/products/:productId/images`.
2. If using local storage, ensure `NEXT_PUBLIC_API_BASE_URL` points to the same backend that serves the images.
3. For production, switch to `UPLOAD_DRIVER=r2` for persistent image storage.

---

## next/image Domain Error

Symptom: Console or build output shows "Invalid src prop ... hostname is not configured under images in your next.config.js".

Diagnosis: The image URL's hostname is not in the `remotePatterns` list in `next.config.ts`.

Fix: The current configuration allows all `https://**` domains and `http://localhost`. If this error appears, verify the image URL is using HTTPS. If using HTTP for a non-localhost domain in development, add a specific pattern:

```ts
{ protocol: 'http', hostname: 'your-dev-host' }
```

---

## Product Detail 404

Symptom: Navigating to `/products/[slug]` shows a 404 page.

Possible causes:
1. The product slug does not exist in the backend.
2. The product `status` is not `PUBLISHED`.
3. The product's category is inactive.

Fix:
1. Verify the product exists: `GET http://localhost:8080/api/public/products/[slug]`
2. If the API returns `PRODUCT_NOT_FOUND`, the product is either not published or does not exist.
3. Use the admin API to set the product status to `PUBLISHED`: `PATCH /api/admin/products/:id/status`

---

## Cart Not Persisting

Symptom: Cart is empty after refreshing the page.

Cause: The session ID in localStorage is being cleared, or a different session ID is being generated.

Diagnosis:
1. Open DevTools > Application > Local Storage > `http://localhost:3000`.
2. Check for `ees_guest_session_id`. If it is missing, the cart was cleared.

Fix:
- Do not clear localStorage between sessions.
- Do not use private/incognito windows for testing unless you want a fresh cart.
- If the backend cart has expired, the session still exists locally but the backend returns a 404, which `getCartOrNull` catches and returns null.

---

## Session ID Missing

Symptom: Cart calls fail with an empty session ID or "sessionId is required" error.

Cause: `getSessionId()` returned an empty string, which happens only in a non-browser environment (SSR).

Fix:
- Cart components are marked `'use client'`. If `getSessionId()` is called in a Server Component, it returns `''`.
- Ensure cart API calls are only made from Client Components or after `useEffect`.

---

## Coupon Not Applying

Symptom: Clicking "Apply" does nothing or shows an error.

Possible error messages from the backend:
- `COUPON_NOT_FOUND` — code does not exist
- `COUPON_NOT_ACTIVE` — coupon is disabled
- `COUPON_EXPIRED` — past the expiry date
- `COUPON_LIMIT_REACHED` — usage limit exceeded
- `COUPON_MIN_AMOUNT` — cart subtotal below minimum order amount

Fix: Check the backend admin API for the coupon's settings. The error message from the backend is displayed directly to the user.

---

## Coupon Remove Failing

Symptom: Clicking "Remove" next to an applied coupon shows an error.

Cause: The backend `DELETE /api/coupons/:sessionId` call failed. This is uncommon but can happen if the session ID is missing or the backend is unavailable.

Fix:
1. Confirm the backend is running.
2. Confirm `ees_guest_session_id` is set in localStorage.
3. Reload the cart and try again.

---

## Checkout Failing

Symptom: Clicking "Confirm Mock Payment" shows an error message.

Possible causes:
1. Cart is empty (backend returns `CART_EMPTY`).
2. A product went out of stock between adding to cart and checking out (`PRODUCT_OUT_OF_STOCK`).
3. Backend is unavailable.

Fix:
1. Reload the cart page to see the current cart state.
2. Remove out-of-stock items.
3. Ensure the backend is running.

---

## Payment Verify Failing

Symptom: Checkout fails at the "verify payment" step with an error.

Cause: The `mockPaymentId` from `createPayment` was null or undefined, or the backend returned a payment error.

Diagnosis: Open browser DevTools > Network. Look for the `/payments/create` and `/payments/verify` requests. Check their response bodies.

Fix:
- If `providerPaymentId` is null in the create response, the backend mock gateway has an issue. Check backend logs.
- If verify fails with `PAYMENT_VERIFICATION_FAILED`, the backend validation logic has rejected the mock ID.

---

## Sitemap Empty or Missing Backend URLs

Symptom: `/sitemap.xml` only contains static routes. No product, category, or collection URLs.

Cause: The backend `GET /api/public/sitemap-data` call failed during page generation.

Fix:
1. Confirm the backend is running.
2. Confirm `NEXT_PUBLIC_API_BASE_URL` is correct.
3. Confirm the backend has published products and active categories/collections.
4. The sitemap revalidates every 3600 seconds. Force a revalidation by redeploying or restarting the dev server.

---

## Metadata Not Updating

Symptom: Page title or description in the browser or social share previews is stale.

Cause: ISR cache has not expired yet (revalidate window is 600 seconds for SEO).

Fix:
- In development, restart `npm run dev` to clear the cache.
- In production, wait for the revalidation window to pass, or trigger a Vercel redeploy.
- Alternatively, update the SEO metadata in the backend admin API and wait for the next revalidation.

---

## Build Errors

Symptom: `npm run build` fails.

Common causes:
1. TypeScript errors — run `npm run typecheck` to see them.
2. Backend unavailable during sitemap pre-rendering.
3. ESLint errors — run `npm run lint` to see them.

Fix:
1. Fix TypeScript and lint errors.
2. Ensure the backend is running before building.

---

## Hydration Issues

Symptom: React console warning about hydration mismatch.

Common cause: A Client Component renders different content on the server vs. browser. The most common case is using `Date.now()` or `localStorage` on the server.

Fix:
- Session ID utilities check `typeof window === 'undefined'` and return `''` on the server. Cart components use `useEffect` so localStorage is only accessed after mount.
- If a new component reads browser-only values, add a `mounted` state and render the browser-specific content only after mount.

---

## Mobile Horizontal Scroll

Symptom: The page scrolls horizontally on mobile.

Common causes:
1. A component has a fixed width wider than the viewport.
2. An image does not respect its container's width.

Fix:
- `overflow-x-hidden` on the body prevents the scrollbar but does not fix the overflow itself.
- Open DevTools > Elements and inspect which element is wider than the viewport.
- Ensure images have `max-width: 100%` (set in `globals.css`).
- Grid columns should use responsive widths, not fixed pixel widths.

---

## Contact Form Submission Failing

Symptom: Clicking "Send Message" shows an error message below the form.

Possible causes:
1. Backend is unavailable — the `/api/public/contact` endpoint is not reachable.
2. Validation error — the backend rejected the input (name, email, or message is missing or invalid).
3. Network error — the browser cannot reach the backend origin.

Diagnosis: Open browser DevTools > Network tab. Look for the `POST /api/public/contact` request. Check the response status and body.

Fix:
1. Confirm the backend is running: `curl http://localhost:8080/api/health`
2. Confirm `NEXT_PUBLIC_API_BASE_URL` in `.env.local` is correct (no trailing slash, includes `/api`).
3. For CORS errors: ensure `CORS_ORIGIN` on the backend includes the frontend origin.
4. For 400 validation errors: the backend requires `name`, `email`, and `message`. The error message from the backend is shown inline in the form.

---

## Contact Form Always Shows Empty After Success

Symptom: After a successful submission, the form shows a success message. Clicking "Send another message" resets the view to an empty form.

This is expected behaviour. The form state is held in React component state and is intentionally reset after a successful submission.
