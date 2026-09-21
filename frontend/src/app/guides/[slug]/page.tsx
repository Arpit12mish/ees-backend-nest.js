import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Container } from '@/components/common/Container';
import { FaqAccordion } from '@/components/faq/FaqAccordion';
import { SafeProductImage } from '@/components/products/SafeProductImage';
import { JsonLd } from '@/components/seo/JsonLd';
import { getGuide, getGuides } from '@/lib/api/guides.api';
import { getEntityFaqs } from '@/lib/api/faqs.api';
import { getGuideSeo } from '@/lib/api/seo.api';
import { absoluteUrl, breadcrumbJsonLd, metadataFromSeo } from '@/lib/utils/seo';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getGuideSeo(slug).catch(() => null);
  return metadataFromSeo(seo, { title: 'Guide', path: `/guides/${slug}` });
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = await getGuide(slug).catch(() => null);
  if (!guide) notFound();

  const [related, faqs] = await Promise.all([
    getGuides({ tags: guide.tags, exclude: guide.slug, page: 1 })
      .then((r) => r.items.slice(0, 3))
      .catch(() => []),
    getEntityFaqs('GUIDE', guide.id).catch(() => []),
  ]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: guide.title, href: `/guides/${guide.slug}` },
  ];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.excerpt ?? undefined,
    image: guide.coverImageUrl ? [absoluteUrl(guide.coverImageUrl)] : undefined,
    datePublished: guide.publishedAt ?? undefined,
    dateModified: guide.updatedAt ?? guide.publishedAt ?? undefined,
    author: { '@type': 'Organization', name: 'Enchanted Energy Store' },
  };

  return (
    <section className="py-6 sm:py-10">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
      <Container className="max-w-3xl">
        <Breadcrumbs items={breadcrumbItems} />
        {guide.coverImageUrl ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-[var(--border)]">
            <SafeProductImage src={guide.coverImageUrl} alt={guide.title} priority sizes="100vw" />
          </div>
        ) : null}
        <h1 className="mt-6 text-3xl font-semibold text-[#17201d] sm:text-4xl">{guide.title}</h1>
        {guide.excerpt ? (
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">{guide.excerpt}</p>
        ) : null}
        <div
          className="prose mt-6 max-w-none text-[15px] leading-7 text-[#34413d]"
          dangerouslySetInnerHTML={{ __html: guide.bodyHtml }}
        />

        {faqs.length ? (
          <div className="mt-10">
            <FaqAccordion faqs={faqs} />
          </div>
        ) : null}

        {related.length ? (
          <div className="mt-10 border-t border-[var(--border)] pt-6">
            <h2 className="text-lg font-semibold text-[#17201d]">Related guides</h2>
            <ul className="mt-3 grid gap-3">
              {related.map((g) => (
                <li key={g.id}>
                  <Link href={`/guides/${g.slug}`} className="font-semibold text-[var(--brand)] hover:underline">
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
