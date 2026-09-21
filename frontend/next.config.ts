import type { NextConfig } from 'next';

// Image hostname note:
// The backend serves images from either local storage (http://localhost) or
// Cloudflare R2 via a configurable R2_PUBLIC_BASE_URL. Set NEXT_PUBLIC_IMAGE_HOSTNAME
// to that deployment's exact R2/CDN hostname in production so the /api/image
// optimizer isn't left as an open proxy; it falls back to https://** only when unset.
// Example: NEXT_PUBLIC_IMAGE_HOSTNAME=pub-abc123.r2.dev
// See frontend/docs/IMAGE_HANDLING.md for full guidance.
const imageHostname = process.env.NEXT_PUBLIC_IMAGE_HOSTNAME;

// The backend (NestJS on AWS) already generates a Google Merchant Center
// product feed at /public/merchant-feed.xml. Proxying it through the
// storefront's own domain at the conventional /feed.xml path means the feed
// URL handed to Merchant Center stays stable even if the backend's host
// changes later, and keeps everything on one domain.
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api';

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      imageHostname
        ? { protocol: 'https', hostname: imageHostname }
        : { protocol: 'https', hostname: '**' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/feed.xml',
        destination: `${apiBaseUrl}/public/merchant-feed.xml`,
      },
    ];
  },
  async redirects() {
    return [
      { source: '/about', destination: '/about-us', permanent: true },
      { source: '/contact', destination: '/contact-us', permanent: true },
      { source: '/privacy', destination: '/privacy-policy', permanent: true },
      {
        source: '/terms',
        destination: '/terms-and-conditions',
        permanent: true,
      },
      // The original demo "Rose Quartz Bracelet" was retired and replaced
      // by a newer product at the same conceptual slug — redirect so any
      // existing rankings/backlinks to the old URL carry over instead of
      // just 404ing now that the old product is unpublished.
      {
        source: '/products/rose-quartz-bracelet-legacy',
        destination: '/products/rose-quartz-bracelet',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
