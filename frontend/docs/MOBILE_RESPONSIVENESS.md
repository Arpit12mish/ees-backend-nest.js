# Mobile Responsiveness

## Strategy

The frontend uses a mobile-first approach with Tailwind CSS utility classes. Styles are written for the smallest screen first, then overridden at larger breakpoints using Tailwind's responsive prefixes (`min-[360px]:`, `sm:`, `md:`, `lg:`).

## Tailwind Breakpoints Used

| Prefix | Min-width | Typical device |
| --- | --- | --- |
| (none) | 0px | Narrow phones, 320px |
| `min-[360px]:` | 360px | Common Android, iPhone SE |
| `sm:` | 640px | Large phones, tablets portrait |
| `md:` | 768px | Tablets, small laptops |
| `lg:` | 1024px | Desktops, tablets landscape |

The `min-[360px]:` breakpoint is used specifically to handle very narrow screens (320px) without breaking the 360px layout. Tailwind 4 supports arbitrary min-width values natively.

## Product Grid

```
Default (< 360px): 1 column
min-[360px]:       2 columns (gap: 16px)
sm (640px+):       3 columns
lg (1024px+):      4 columns
```

Defined in `components/products/ProductGrid.tsx`:
```
grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 min-[360px]:gap-4 sm:grid-cols-3 lg:grid-cols-4
```

## Product Card

- Fixed `aspect-square` image area prevents layout shift.
- Product name uses `line-clamp-2` to prevent overflow.
- Text size is `text-sm` on mobile, `text-base` on sm.
- Padding is `p-3` on mobile, `p-4` on sm.
- "Add to cart" button is full width (`w-full`) with `min-h-11` (44px).

## Product Detail Page

- Image gallery is full-width on mobile; 50% grid column on lg (`grid lg:grid-cols-2`).
- Content sections (story, traditional associations, usage guide, etc.) stack vertically.
- Attributes sidebar appears below content on mobile, beside on lg (`grid lg:grid-cols-[1fr_360px]`).
- Thumbnail strip is 5 columns on mobile, 6 on sm.

## Header and Navigation

- Desktop nav (`md:flex`) is hidden on mobile.
- `MobileNav` (`md:hidden`) shows a "Menu" button on screens narrower than `md` (768px).
- When open, the mobile nav overlays a full-width panel positioned below the header with `absolute left-0 right-0 top-full`.
- Each mobile nav link has `py-3 px-3` padding (touch-friendly vertical height).
- Brand name truncates on very narrow screens via `truncate` and `shrink`.
- The header subtitle ("Crystals and mindful living") is hidden on screens narrower than 360px.
- Header is `sticky top-0 z-40` to stay visible while scrolling.

## Cart Link in Header

- Displays "Cart" text with an item count badge.
- Button has `min-h-11 px-3 sm:px-4` — slightly smaller horizontal padding on mobile to save space.

## Cart Page

- Items list and CartSummary are stacked vertically on mobile, side-by-side on lg (`grid lg:grid-cols-[1fr_360px]`).
- Quantity buttons are `min-h-10 min-w-10` (40px).

## Checkout Page

- Form is full-width on mobile, beside CartSummary on lg.
- All form inputs have `min-h-11` (44px) for touch accessibility.
- Submit button has `min-h-12` (48px).

## Footer

- 1 column on mobile, 2 on sm, 4 on lg (`grid sm:grid-cols-2 lg:grid-cols-4`).
- Text is small and white/75 opacity for legibility on dark background.

## Category and Collection Pages

- Category cards: 1 column on mobile, 2 on sm, 3 on lg.
- Collection cards: same grid.

## Homepage Sections

- Hero section: `min-h-[500px]` on mobile, `min-h-[620px]` on sm. CTA buttons stack vertically on mobile (`flex-col`), go horizontal on sm (`sm:flex-row`).
- Category grid: 2 on sm, 3 on lg (CategorySection handles its own responsive layout).

## No Horizontal Scroll

- `overflow-x-hidden` on the `<body>` element prevents horizontal overflow.
- All grids use `gap` without negative margins.
- Images use `max-width: 100%` in global CSS.
- Mobile nav uses `absolute` positioning constrained by `left-0 right-0`.

## Image Aspect Ratio

- Product images use `relative aspect-square` containers so the height is always equal to the width. This prevents layout shift during image loading.
- `next/image` with `fill` layout is used inside these containers.

## Touch Targets

All interactive elements meet the 44px minimum touch target recommendation:
- Buttons: `min-h-11` (44px)
- Links in nav: `py-3` padding (vertical height ≥ 44px)
- Quantity controls: `min-h-10 min-w-10` (40px — slightly below recommendation; acceptable for secondary controls)

## iOS Safari Considerations

- `env(safe-area-inset-bottom)` is available via the `.safe-bottom` CSS class defined in `globals.css`. Apply this class to elements that should avoid the iOS home indicator area.
- `scroll-behavior: smooth` is set on `html` for anchor navigation.
- `color-scheme: light` is set in `:root` so Safari renders the status bar and scroll chrome in light mode.

## Android Chrome Considerations

- `crypto.randomUUID()` is used for session ID generation with a `Date.now()` + `Math.random()` fallback for older browsers.
- No touch-specific CSS (like `-webkit-tap-highlight-color`) is applied; Tailwind's reset handles this.

## Font and Text Rendering

- `antialiased` class on the body enables font smoothing.
- Font family is `Arial, Helvetica, sans-serif` (system fonts, no external font loading).
- This keeps the page fast on mobile networks with no font fetch delay.
