import { getCategories } from '@/lib/api/categories.api';
import { getCollections } from '@/lib/api/collections.api';
import { getGuides } from '@/lib/api/guides.api';
import { absoluteUrl, SITE_NAME, SITE_URL } from '@/lib/utils/seo';

// llms.txt is an emerging, robots.txt-style convention that gives AI
// crawlers and agents (ChatGPT, Claude, Perplexity, Gemini, etc.) a curated,
// markdown-formatted map of the site's most important content, so they can
// find and cite it accurately instead of relying purely on raw HTML crawling.
// See https://llmstxt.org for the proposal this follows.
export async function GET() {
  const [categories, collections, guides] = await Promise.all([
    getCategories().catch(() => ({ items: [] })),
    getCollections().catch(() => []),
    getGuides().catch(() => ({ items: [] })),
  ]);

  const lines: string[] = [];
  lines.push(`# ${SITE_NAME}`);
  lines.push('');
  lines.push(
    '> Crystals, stones, and mindful energy products (bracelets, pendulums, and loose stones) traditionally associated with positivity, balance, protection, and intentional living. Descriptions reflect traditional and symbolic associations, not medical claims.',
  );
  lines.push('');

  lines.push('## Shop');
  lines.push(`- [All products](${absoluteUrl('/products')}): Full product catalog.`);
  for (const category of categories.items) {
    lines.push(
      `- [${category.name}](${absoluteUrl(`/categories/${category.slug}`)})${
        category.description ? `: ${category.description}` : ''
      }`,
    );
  }
  lines.push('');

  if (collections.length) {
    lines.push('## Curated collections');
    for (const collection of collections) {
      lines.push(
        `- [${collection.name}](${absoluteUrl(`/collections/${collection.slug}`)})${
          collection.description ? `: ${collection.description}` : ''
        }`,
      );
    }
    lines.push('');
  }

  if (guides.items.length) {
    lines.push('## Guides');
    for (const guide of guides.items) {
      lines.push(
        `- [${guide.title}](${absoluteUrl(`/guides/${guide.slug}`)})${
          guide.excerpt ? `: ${guide.excerpt}` : ''
        }`,
      );
    }
    lines.push('');
  }

  lines.push('## Other');
  lines.push(`- [Frequently asked questions](${absoluteUrl('/faq')})`);
  lines.push(`- [About us](${absoluteUrl('/about-us')})`);
  lines.push(`- [Contact us](${absoluteUrl('/contact-us')})`);
  lines.push(`- [Shipping policy](${absoluteUrl('/shipping-policy')})`);
  lines.push(`- [Cancellation and refund policy](${absoluteUrl('/cancellation-and-refund-policy')})`);
  lines.push(`- [Sitemap](${SITE_URL}/sitemap.xml)`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
