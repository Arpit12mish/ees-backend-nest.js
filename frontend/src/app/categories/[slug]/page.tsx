import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Container } from '@/components/common/Container';
import { ProductGrid } from '@/components/products/ProductGrid';
import { FaqAccordion } from '@/components/faq/FaqAccordion';
import { JsonLd } from '@/components/seo/JsonLd';
import { TrackView } from '@/components/analytics/TrackView';
import { getCategory } from '@/lib/api/categories.api';
import { getProductsByCategory } from '@/lib/api/products.api';
import { getCategorySeo } from '@/lib/api/seo.api';
import { getEntityFaqs } from '@/lib/api/faqs.api';
import { breadcrumbJsonLd, itemListJsonLd, metadataFromSeo } from '@/lib/utils/seo';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getCategorySeo(slug).catch(() => null);
  return metadataFromSeo(seo, { title: 'Category', path: `/categories/${slug}` });
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [category, products] = await Promise.all([
    getCategory(slug).catch(() => null),
    getProductsByCategory(slug).catch(() => null),
  ]);

  if (!category) notFound();

  const faqs = await getEntityFaqs('CATEGORY', category.id).catch(() => []);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: category.name, href: `/categories/${category.slug}` },
  ];
  const items = products?.items ?? [];

  return (
    <section className="py-8 sm:py-12">
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
      {items.length ? (
        <JsonLd
          data={itemListJsonLd(
            items.map((p) => ({ name: p.name, href: `/products/${p.slug}` })),
          )}
        />
      ) : null}
      <TrackView type="CATEGORY_VIEW" categoryId={category.id} />
      <Container>
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mb-7 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
            Category
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#17201d] sm:text-4xl">
            {category.name}
          </h1>
          {category.description ? (
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              {category.description}
            </p>
          ) : null}
        </div>
        <ProductGrid products={items} />
        {faqs.length ? (
          <div className="mt-10">
            <FaqAccordion faqs={faqs} />
          </div>
        ) : null}
      </Container>
    </section>
  );
}
