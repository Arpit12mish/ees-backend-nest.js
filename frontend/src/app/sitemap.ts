import type { MetadataRoute } from 'next';
import { getSitemapData } from '@/lib/api/seo.api';
import { SITE_URL } from '@/lib/utils/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const backendUrls = await getSitemapData().catch(() => []);
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/products',
    '/categories',
    '/collections',
    '/services',
    '/guides',
    '/faq',
    '/about-us',
    '/contact-us',
    '/privacy-policy',
    '/terms-and-conditions',
    '/shipping-policy',
    '/cancellation-and-refund-policy',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  return [
    ...staticRoutes,
    ...backendUrls.map((item) => ({
      url: item.url,
      lastModified: new Date(item.lastModified),
      changeFrequency: item.changeFrequency as MetadataRoute.Sitemap[number]['changeFrequency'],
      priority: item.priority,
      images: item.images,
    })),
  ];
}
