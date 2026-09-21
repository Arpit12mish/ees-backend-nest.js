# Testing Guide

No automated test suite (unit, integration, or end-to-end) is configured. All verification is done via the commands below and the manual checklist.

## Commands

### Lint

```bash
npm run lint
```

Runs ESLint with `eslint-config-next`. Reports style, accessibility, and import issues.

### Typecheck

```bash
npm run typecheck
```

Runs `tsc --noEmit`. Reports TypeScript type errors. Must pass before deploying.

### Build

```bash
npm run build
```

Compiles the application and runs all page-level static generation. The backend must be running because the sitemap fetches live data during build. A successful build confirms there are no build-time errors.

## Manual Test Checklist

Run through this checklist after every significant change and before deployment.

### Homepage

- [ ] Page loads without error state
- [ ] Hero section shows a product image (if featured products exist)
- [ ] Featured products row shows products
- [ ] Category grid shows categories
- [ ] Collection grid shows collections
- [ ] "Shop products" and "Explore collections" links work

### Product Listing

- [ ] `/products` loads and shows product cards
- [ ] `/products?q=crystal` shows search results
- [ ] `/products?q=nomatch12345` shows the empty state
- [ ] Each product card shows name, price, stock status
- [ ] "Add to cart" on an in-stock product works
- [ ] Out-of-stock products show "Out of stock" and disable the button

### Product Detail

- [ ] `/products/[slug]` loads for a valid slug
- [ ] `/products/invalid-slug` shows the 404 page
- [ ] Image gallery shows the main image and thumbnails (if multiple images)
- [ ] Thumbnails are clickable and change the main image
- [ ] "Add to cart" adds the product to the cart
- [ ] Out-of-stock products disable the add-to-cart button
- [ ] View page source — confirm `<title>`, `<meta name="description">`, `<link rel="canonical">`, and `<script type="application/ld+json">` are present

### Categories

- [ ] `/categories` loads the category grid
- [ ] Clicking a category opens `/categories/[slug]`
- [ ] Category detail shows category name and products

### Collections

- [ ] `/collections` loads the collection grid
- [ ] Clicking a collection opens `/collections/[slug]`
- [ ] Collection detail shows collection name and products

### Cart

- [ ] Add a product — cart count badge in header increments
- [ ] `/cart` shows the added product
- [ ] Increase quantity — subtotal updates
- [ ] Decrease quantity to 1 — minus button disables
- [ ] Remove item — item disappears, count decrements
- [ ] Apply a valid coupon code — discount appears in summary
- [ ] Apply an invalid code — error message appears
- [ ] Reload page — cart persists (localStorage session)
- [ ] Cart count in header updates after add/remove

### Checkout

- [ ] `/checkout` shows the cart summary and form
- [ ] Fill form with test data and submit — redirects to `/order-success`
- [ ] `/order-success` shows the order number
- [ ] Cart count resets to 0 after checkout
- [ ] Submit with empty required fields — browser validation prevents submission

### Static Pages

- [ ] `/about-us` loads
- [ ] `/contact-us` loads
- [ ] `/privacy-policy` loads
- [ ] `/terms-and-conditions` loads
- [ ] `/shipping-policy` loads
- [ ] `/return-policy` loads
- [ ] `/about`, `/contact`, `/privacy`, `/terms` load (legacy aliases)

### Sitemap and Robots

- [ ] `/sitemap.xml` — contains homepage, /products, /categories, /collections, and product/category/collection URLs
- [ ] `/robots.txt` — disallows /cart, /checkout, /order-success, /admin; lists correct sitemap URL

## SEO Testing Checklist

- [ ] Product page has correct `<title>` tag
- [ ] Product page has `<meta name="description">` with safe wording
- [ ] Product page has `<link rel="canonical">`
- [ ] Product page has `og:title`, `og:description`, `og:image`, `og:url`
- [ ] Product page has `twitter:card`, `twitter:title`, `twitter:description`
- [ ] Product page has `<script type="application/ld+json">` with Product schema
- [ ] Category page has SEO metadata
- [ ] Collection page has SEO metadata
- [ ] Run Google's Rich Results Test on a product URL to verify JSON-LD

## Mobile Testing Checklist

Test on real devices or browser device emulation:

- [ ] 320px width — no horizontal scroll, readable text
- [ ] 360px width — 2-column product grid
- [ ] 375px (iPhone) — layout correct in iOS Safari
- [ ] 390px (iPhone 14) — layout correct
- [ ] 768px (tablet) — layout correct
- [ ] 1024px (laptop) — switches to desktop layout

Check:
- [ ] Mobile nav opens on tap and closes after link click
- [ ] Cart button is reachable on all screen sizes
- [ ] All buttons and links have sufficient tap target size
- [ ] No horizontal scrollbar appears at any width

## Backend Availability Testing

Test what happens when the backend is unavailable:
- [ ] `/products` shows error state (not a crash)
- [ ] `/categories` shows error state
- [ ] `/collections` shows error state
- [ ] Homepage renders with empty sections (not a crash)
- [ ] Product detail 404s or shows error state (not an unhandled exception)
- [ ] Sitemap returns only static routes (not empty or broken XML)

## Browser Testing

Verify on:
- [ ] Chrome (latest)
- [ ] Safari/iOS (latest)
- [ ] Firefox (latest)
- [ ] Android Chrome (latest)

## Lighthouse

Run Lighthouse in Chrome DevTools on the homepage and a product detail page.

Targets:
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: 100

Common issues to look for:
- Images without width/height (use `fill` with sized containers)
- Missing alt text
- Missing meta description
- Render-blocking resources
- Large images not served at the right size
