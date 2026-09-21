# Routes

All routes are defined under `src/app/` using the Next.js App Router. Server Components fetch data directly. Client Components handle interactivity.

---

## `/`

**File:** `src/app/page.tsx`
**Type:** Server Component

**Purpose:** Homepage with hero section, featured products, category grid, collection grid, and two informational sections about safe product language and shop features.

**Backend APIs used:**
- `GET /api/public/products/featured` — up to 12 featured products for the hero and featured row
- `GET /api/public/categories` — all active categories for the category section
- `GET /api/public/collections` — all active collections for the collection section

All three are fetched in parallel. Each call uses `.catch(() => [])` so a backend failure renders an empty section rather than crashing.

**SEO:** Static metadata defined inline in the page. Title: "Crystals, Stones, and Mindful Energy Products". No `generateMetadata`.

**Mobile notes:** Hero section has a minimum height of 500px (620px on sm). CTA buttons stack vertically on mobile, go horizontal on sm. Category and collection grids are 1 column on mobile, 2 on sm, 3 on lg.

---

## `/products`

**File:** `src/app/products/page.tsx`
**Type:** Server Component

**Purpose:** Product listing. Supports full-text search via `?q=` query parameter and pagination via `?page=`. Without search, shows all products sorted by priority.

**Backend APIs used:**
- `GET /api/public/products/search?q=&page=` — when `?q=` is present
- `GET /api/public/products?page=&sort=priority` — when no search query

**SEO:** Static metadata. Title: "Shop Products". No dynamic metadata because this page does not correspond to a single entity.

**Pagination:** Previous/Next links rendered by the `Pagination` component (`src/components/common/Pagination.tsx`) using `data.meta.page` and `data.meta.totalPages`. Both `?q=` and `?page=` query params are preserved when navigating between pages. The `Pagination` component renders nothing when `totalPages <= 1`.

**Mobile notes:** Product grid is 1 column default, 2 at 360px, 3 at sm, 4 at lg. Each ProductCard has a fixed aspect-square image area. Pagination controls are centered with `min-h-11` touch targets.

---

## `/products/[slug]`

**File:** `src/app/products/[slug]/page.tsx`
**Type:** Server Component

**Purpose:** Product detail page. Shows image gallery, name, price, stock status, short description, add-to-cart button, and content sections (story, traditional associations, usage guide, care instructions, long description). Renders product attributes in a sidebar.

**Backend APIs used:**
- `GET /api/public/products/:slug` — product data
- `GET /api/public/seo/product-schema/:slug` — JSON-LD for structured data
- `GET /api/public/seo/product/:slug` — SEO metadata via `generateMetadata`

All three fetches run, some in parallel. If the product is not found, `notFound()` is called.

**SEO:** `generateMetadata` fetches product SEO from the backend. Falls back to a default title and canonical URL if unavailable. JSON-LD is rendered via `<ProductSeoJsonLd>`.

**Mobile notes:** Image gallery is full-width on mobile, 50% on lg. Thumbnail strip shows 5 columns on mobile, 6 on sm. Content sections stack vertically; attributes sidebar appears below on mobile and beside on lg.

---

## `/categories`

**File:** `src/app/categories/page.tsx`
**Type:** Server Component

**Purpose:** Grid of all active categories. Each card links to `/categories/[slug]`.

**Backend APIs used:**
- `GET /api/public/categories?page=1&limit=50` — all active categories

**SEO:** Static metadata. Title: "Categories".

**Mobile notes:** 1 column on mobile, 2 on sm, 3 on lg. Each category card shows the name and a truncated description (3 lines max).

---

## `/categories/[slug]`

**File:** `src/app/categories/[slug]/page.tsx`
**Type:** Server Component

**Purpose:** Shows category name, description, and a product grid filtered to that category.

**Backend APIs used:**
- `GET /api/public/categories/:slug` — category data
- `GET /api/public/products/category/:categorySlug` — products in this category
- `GET /api/public/seo/category/:slug` — SEO metadata via `generateMetadata`

If the category is not found, `notFound()` is called. Products use `.catch(() => null)` and render an empty grid if unavailable.

**SEO:** `generateMetadata` fetches category SEO. Falls back gracefully.

**Mobile notes:** Same product grid layout as `/products`.

---

## `/collections`

**File:** `src/app/collections/page.tsx`
**Type:** Server Component

**Purpose:** Grid of all active collections. Each card links to `/collections/[slug]`. Collection cards use a dark background (`#17201d` with white text) to visually distinguish from category cards.

**Backend APIs used:**
- `GET /api/public/collections` — all active collections

**SEO:** Static metadata. Title: "Collections".

**Mobile notes:** 1 column on mobile, 2 on sm, 3 on lg.

---

## `/collections/[slug]`

**File:** `src/app/collections/[slug]/page.tsx`
**Type:** Server Component

**Purpose:** Shows collection name, description, and its products.

**Backend APIs used:**
- `GET /api/public/collections/:slug/products?page=1&limit=20` — returns `{ collection, items, meta }`
- `GET /api/public/seo/collection/:slug` — SEO metadata via `generateMetadata`

If collection products cannot be fetched, `notFound()` is called.

**SEO:** `generateMetadata` fetches collection SEO. Falls back gracefully.

**Mobile notes:** Same product grid layout as `/products`.

---

## `/cart`

**File:** `src/app/cart/page.tsx`
**Type:** Client Component (`'use client'`)

**Purpose:** Guest cart. Shows items with quantity controls and remove buttons. Includes a `CartSummary` with order totals and coupon input. Links to `/checkout`.

**Backend APIs used (client-side):**
- `GET /api/cart/:sessionId` — load cart on mount and after updates
- `PATCH /api/cart/items/:itemId` — update quantity
- `DELETE /api/cart/items/:itemId` — remove item
- `POST /api/coupons/validate` — apply coupon

Session ID comes from `getSessionId()` which reads or creates an ID in localStorage. Cart refreshes via `ees-cart-updated` DOM event.

**SEO:** No metadata exported. Page is disallowed in robots.txt.

**Mobile notes:** Items stack in a single column. Cart summary appears below items on mobile, beside on lg.

---

## `/checkout`

**File:** `src/app/checkout/page.tsx`
**Type:** Client Component (`'use client'`)

**Purpose:** Shipping address form and mock payment. Redirects to `/order-success?orderNumber=` on success.

**Backend APIs used (client-side):**
- `GET /api/cart/:sessionId` — load cart on mount
- `POST /api/coupons/validate` — apply coupon
- `POST /api/orders` — create order
- `POST /api/payments/create` — create mock payment
- `POST /api/payments/verify` — verify payment

Form fields: Full name, Email, Phone, Address line 1, Address line 2 (optional), City, State, Pincode, Country (defaults to "India").

**SEO:** No metadata exported. Page is disallowed in robots.txt.

**Mobile notes:** Form is full-width. CartSummary appears below form on mobile, beside on lg. All form inputs have `min-h-11` for touch-target compliance. Submit button shows "Processing" while busy.

---

## `/order-success`

**File:** `src/app/order-success/page.tsx`
**Type:** Server Component (reads searchParams)

**Purpose:** Confirmation page shown after successful checkout. Reads `?orderNumber=` from the URL and displays it. Provides a link back to `/products`.

**Backend APIs used:** None. The order number is passed via URL from the checkout redirect.

**SEO:** No metadata exported. Page is disallowed in robots.txt.

**Mobile notes:** Centered card layout, max width 2xl. Suitable for all screen sizes.

---

## `/about-us`

**File:** `src/app/about-us/page.tsx`
**Type:** Server Component

**Purpose:** Static about page describing Energy Essentials and its commitment to safe, non-medical product language.

**Backend APIs used:** None.

**SEO:** Static metadata. Title: "About Us".

**Mobile notes:** Single column, max width 3xl.

---

## `/contact-us`

**File:** `src/app/contact-us/page.tsx`
**Type:** Server Component (page) + Client Component (form)

**Purpose:** Contact page with a support email address and an interactive contact form. Submissions are sent to the backend and stored as contact leads.

**Backend APIs used:**
- `POST /api/public/contact` — called by `ContactForm` on submit; stores the lead with status `NEW`

**Components:**
- `src/components/contact/ContactForm.tsx` — manages form state, validation, submission, success/error display (Client Component)

**Form fields:** name (required), email (required), phone (optional), subject (optional), message (required, min 10 chars)

**Success behaviour:** Form is cleared and a confirmation message is shown in place of the form. A "Send another message" button resets the view.

**Error behaviour:** Backend error message is shown below the form fields.

**SEO:** Static metadata. Title: "Contact Us". Metadata is defined in the Server Component and is not affected by the Client Component.

**Mobile notes:** Single column layout, max width 3xl. Form fields stack to a 2-column grid on `sm`. Submit button is full-width on mobile, auto-width on `sm`.

---

## `/privacy-policy`

**File:** `src/app/privacy-policy/page.tsx`
**Type:** Server Component

**Purpose:** Placeholder privacy policy. Contains two short paragraphs and a note to replace with reviewed legal content before launch.

**Backend APIs used:** None.

**SEO:** Static metadata. Title: "Privacy Policy".

---

## `/terms-and-conditions`

**File:** `src/app/terms-and-conditions/page.tsx`
**Type:** Server Component

**Purpose:** Placeholder terms and conditions. Notes that product information is not medical advice and must be replaced before launch.

**Backend APIs used:** None.

**SEO:** Static metadata. Title: "Terms and Conditions".

---

## `/shipping-policy`

**File:** `src/app/shipping-policy/page.tsx`
**Type:** Server Component

**Purpose:** Placeholder shipping policy. Notes that shipping charges come from the backend and that delivery details must be added before launch.

**Backend APIs used:** None.

**SEO:** Static metadata. Title: "Shipping Policy".

---

## `/return-policy`

**File:** `src/app/return-policy/page.tsx`
**Type:** Server Component

**Purpose:** Placeholder return policy. Notes that return windows and exclusions must be added before launch.

**Backend APIs used:** None.

**SEO:** Static metadata. Title: "Return Policy".

---

## `/sitemap.xml`

**File:** `src/app/sitemap.ts`
**Type:** Next.js sitemap route

**Purpose:** Generates a sitemap combining static routes and backend-provided URLs.

**Static routes included:** `/`, `/products`, `/categories`, `/collections`, `/about-us`, `/contact-us`, `/privacy-policy`, `/terms-and-conditions`, `/shipping-policy`, `/return-policy`.

**Backend API used:**
- `GET /api/public/sitemap-data` — returns product, category, and collection URLs with `lastModified`, `changeFrequency`, and `priority`

Revalidates every 3600 seconds. Falls back to static routes only if the backend is unavailable.

---

## `/robots.txt`

**File:** `src/app/robots.ts`
**Type:** Next.js robots route

**Purpose:** Instructs crawlers to allow all routes except private ones.

**Disallowed paths:** `/cart`, `/checkout`, `/order-success`, `/admin`

**Sitemap pointer:** `${SITE_URL}/sitemap.xml`

---

## Legacy Alias Routes

These routes re-export the content from the canonical routes. They exist for backwards compatibility in case old links or bookmarks use the shorter paths.

| Legacy route | Canonical route |
| --- | --- |
| `/about` | `/about-us` |
| `/contact` | `/contact-us` |
| `/privacy` | `/privacy-policy` |
| `/terms` | `/terms-and-conditions` |

Each file contains only: `export { metadata, default } from '../canonical-route/page';`
