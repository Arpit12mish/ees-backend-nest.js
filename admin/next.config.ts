import type { NextConfig } from 'next';

// Image hostname note: mirrors frontend/next.config.ts — the backend serves
// images from local storage, Cloudflare R2, or AWS S3 depending on
// UPLOAD_DRIVER, so the exact hostname isn't known at build time here.
// Replace https://** with your specific storage/CDN hostname in production.
const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
