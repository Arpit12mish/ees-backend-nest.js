# Frontend Website

Energy Essentials storefront built with Next.js App Router. Serves public-facing product discovery, cart, checkout, and order confirmation for a crystals and mindful energy products store.

## Overview

This is the customer-facing website for Energy Essentials. It connects to a NestJS backend API for all catalog, cart, order, and payment data. The frontend has no database of its own; all persistent state lives in the backend.

## Business Context

The store sells crystals, stones, bracelets, pyramids, candles, and cleansing products. All product copy uses traditional associations and symbolic language. Medical claims and guaranteed spiritual outcomes are not used.

## Tech Stack

| Tool | Version | Role |
| --- | --- | --- |
| Next.js | ^16.2.6 | App Router, SSR, sitemap, robots |
| React | ^19.2.6 | UI rendering |
| TypeScript | ^5.9.3 | Static typing |
| Tailwind CSS | ^4.1.16 | Utility-first styling |

No external state management library, no UI component library, no testing framework is installed.

## Features Implemented

- Homepage with hero, featured products, categories, and collections
- Product listing with search and sort
- Product detail with image gallery, attributes, stock status, and JSON-LD
- Category listing and category product pages
- Collection listing and collection product pages
- Guest cart with coupon support
- Checkout with shipping address form
- Mock payment flow (create and verify)
- Order success confirmation
- Contact Us page with form that submits to `POST /api/public/contact`
- Static pages: About Us, Privacy Policy, Terms and Conditions, Shipping Policy, Return Policy
- Sitemap generated from backend data plus static routes
- Robots.txt disallowing cart, checkout, order-success, and admin

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage |
| `/products` | All products; supports `?q=` search and `?page=` |
| `/products/[slug]` | Product detail |
| `/categories` | Category listing |
| `/categories/[slug]` | Category products |
| `/collections` | Collection listing |
| `/collections/[slug]` | Collection products |
| `/cart` | Guest cart |
| `/checkout` | Shipping form and mock payment |
| `/order-success` | Confirmation page, reads `?orderNumber=` |
| `/about-us` | About page |
| `/contact-us` | Contact page |
| `/privacy-policy` | Privacy placeholder |
| `/terms-and-conditions` | Terms placeholder |
| `/shipping-policy` | Shipping placeholder |
| `/return-policy` | Return policy placeholder |
| `/sitemap.xml` | Auto-generated sitemap |
| `/robots.txt` | Auto-generated robots |
| `/about` | Alias for `/about-us` |
| `/contact` | Alias for `/contact-us` |
| `/privacy` | Alias for `/privacy-policy` |
| `/terms` | Alias for `/terms-and-conditions` |

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL including `/api` suffix |
| `NEXT_PUBLIC_SITE_URL` | Frontend origin used for canonical URLs and sitemap |

Example `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for production examples and common mistakes.

## Local Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with local values
npm run dev
```

The backend must be running before the frontend can load any product, category, or collection data. See [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md) for the full checklist.

## Backend Dependency

The frontend has no data of its own. It fetches all catalog, cart, order, and payment data from the NestJS backend at `NEXT_PUBLIC_API_BASE_URL`. If the backend is unavailable, product and category pages render an error state. Cart and checkout pages fail silently or show an error message.

## SEO Implementation

- `generateMetadata` in each dynamic route fetches SEO data from the backend.
- Product, category, and collection pages use `metadataFromSeo` to build Open Graph, Twitter Card, and canonical URL metadata.
- Product detail pages render a `<script type="application/ld+json">` block from the backend product schema endpoint.
- Sitemap is built by combining static routes with backend sitemap data.
- Robots.txt disallows private routes.

See [docs/SEO_IMPLEMENTATION.md](docs/SEO_IMPLEMENTATION.md) for full details.

## Mobile Responsiveness

- Mobile-first Tailwind grid: 1 column default, 2 at 360px, 3 at 640px, 4 at 1024px.
- Header hides desktop nav on small screens and shows a Menu button.
- `overflow-x-hidden` on body prevents horizontal scroll.
- `env(safe-area-inset-bottom)` available via `.safe-bottom` CSS class for iOS notch support.
- Minimum touch target height of 44px (`min-h-11`) applied to all buttons and links.

See [docs/MOBILE_RESPONSIVENESS.md](docs/MOBILE_RESPONSIVENESS.md) for full details.

## Cart and Checkout

- Guest cart uses a UUID session ID stored in `localStorage` under key `ees_guest_session_id`.
- Cart count in the header refreshes via a custom DOM event `ees-cart-updated`.
- Applied coupons can be removed via the "Remove" button that appears beside the coupon code in the cart summary.
- Checkout collects customer name, email, phone, and a shipping address, then calls create order, create payment, and verify payment in sequence.
- Payment is mock-only: no real payment provider is integrated.

See [docs/CART_CHECKOUT_FLOW.md](docs/CART_CHECKOUT_FLOW.md) for the complete flow.

## Testing

```bash
npm run lint
npm run build
npm run typecheck
```

No automated test suite is configured. See [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) for a manual test checklist.

## Deployment

Designed for Vercel. Set `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SITE_URL` in the Vercel project environment variables. The backend must be deployed and accessible before the frontend build completes, because sitemap generation fetches live backend data at build time.

See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for the full deployment checklist.

## Documentation Index

| Document | Contents |
| --- | --- |
| [docs/FRONTEND_ARCHITECTURE.md](docs/FRONTEND_ARCHITECTURE.md) | App Router patterns, data fetching, component types |
| [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) | Every folder and file group explained |
| [docs/ROUTES.md](docs/ROUTES.md) | Each route with APIs, SEO, and mobile notes |
| [docs/API_INTEGRATION.md](docs/API_INTEGRATION.md) | API client usage, unwrapping, error handling |
| [docs/SEO_IMPLEMENTATION.md](docs/SEO_IMPLEMENTATION.md) | Metadata, JSON-LD, sitemap, robots |
| [docs/MOBILE_RESPONSIVENESS.md](docs/MOBILE_RESPONSIVENESS.md) | Grid breakpoints, nav, touch targets |
| [docs/CART_CHECKOUT_FLOW.md](docs/CART_CHECKOUT_FLOW.md) | Session ID, cart events, mock payment |
| [docs/IMAGE_HANDLING.md](docs/IMAGE_HANDLING.md) | SafeProductImage, image priority, fallback |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) | Env variables with local and production examples |
| [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md) | Install, configure, and run locally |
| [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | Vercel deployment steps |
| [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) | Manual checklist, lint, build, typecheck |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common errors and fixes |
| [docs/FRONTEND_BACKEND_CONTRACT.md](docs/FRONTEND_BACKEND_CONTRACT.md) | Which route depends on which API |

## Current Limitations

- Payment is mock-only. No real payment gateway (Razorpay, Stripe, etc.) is integrated.
- Static policy pages (Privacy Policy, Terms, Shipping Policy, Return Policy) contain placeholder text that must be replaced with reviewed legal content before launch.
- No admin panel is included in the frontend. Admin operations (including reviewing contact leads via `GET /api/admin/contact-leads`) use the backend API directly or a separate admin UI.
- No automated test suite (unit, integration, or end-to-end) is configured.
- The `next/image` remote pattern uses `https://**` because the R2 image hostname is set at deploy time. Restrict it to your specific hostname before production for security.

## Future Improvements

- Replace mock payment with a real payment gateway.
- Build an admin panel to review and action contact leads from `/api/admin/contact-leads`.
- Replace placeholder policy pages with reviewed legal content.
- Add filter controls (category, price range) to the products page.
- Restrict `next/image` remote patterns to the specific production image hostname.
- Configure error monitoring (Sentry or equivalent).
- Add automated end-to-end tests with Playwright or Cypress.
