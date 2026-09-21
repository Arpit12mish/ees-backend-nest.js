import type { Metadata } from 'next';
import type { SeoMetadata } from '@/lib/types/seo.types';

export const SITE_NAME = 'Enchanted Energy Store';
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export function safeTitle(title?: string | null, fallback = SITE_NAME) {
  return title?.trim() || fallback;
}

// The root layout's title template (`%s | ${SITE_NAME}`) appends the brand
// exactly once to whatever `Metadata.title` a page returns. Backend-supplied
// titles occasionally already end with " | Enchanted Energy Store" (either
// from the auto-generated SEO fallback or admin-entered copy), which would
// otherwise render as "... | Enchanted Energy Store | Enchanted Energy Store".
// Strip it here so the <title> tag always shows the brand exactly once,
// while leaving the original (brand-included) string available for
// OpenGraph/Twitter titles, which Next does not auto-template.
function stripBrandSuffix(title: string): string {
  const suffix = ` | ${SITE_NAME}`;
  return title.toLowerCase().endsWith(suffix.toLowerCase())
    ? title.slice(0, -suffix.length)
    : title;
}

export function safeDescription(description?: string | null) {
  return (
    description?.trim() ||
    'Discover crystals, stones, and mindful energy products traditionally associated with positivity, balance, protection, and intentional living.'
  );
}

export function metadataFromSeo(
  seo: SeoMetadata | null | undefined,
  fallback: { title: string; description?: string; path?: string },
): Metadata {
  const rawTitle = safeTitle(seo?.title, fallback.title);
  const pageTitle = stripBrandSuffix(rawTitle);
  const description = safeDescription(seo?.description ?? fallback.description);
  const canonical =
    seo?.canonicalUrl ??
    `${SITE_URL}${fallback.path?.startsWith('/') ? fallback.path : `/${fallback.path ?? ''}`}`;
  const image = seo?.openGraph?.image ?? seo?.twitter?.image;

  return {
    title: pageTitle,
    description,
    keywords: seo?.keywords,
    alternates: { canonical },
    robots: seo?.robots,
    openGraph: {
      title: seo?.openGraph?.title ?? rawTitle,
      description: seo?.openGraph?.description ?? description,
      url: canonical,
      siteName: SITE_NAME,
      images: image ? [{ url: image }] : undefined,
      type: 'website',
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: seo?.twitter?.title ?? rawTitle,
      description: seo?.twitter?.description ?? description,
      images: image ? [image] : undefined,
    },
  };
}

export function absoluteUrl(path = '/') {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function breadcrumbJsonLd(items: Array<{ label: string; href: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function itemListJsonLd(
  items: Array<{ name: string; href: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.href),
    })),
  };
}
