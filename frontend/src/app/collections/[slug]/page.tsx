import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Container } from '@/components/common/Container';
import { ProductGrid } from '@/components/products/ProductGrid';
import { JsonLd } from '@/components/seo/JsonLd';
import { TrackView } from '@/components/analytics/TrackView';
import { getCollectionProducts } from '@/lib/api/collections.api';
import { getCollectionSeo } from '@/lib/api/seo.api';
import { breadcrumbJsonLd, itemListJsonLd, metadataFromSeo } from '@/lib/utils/seo';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getCollectionSeo(slug).catch(() => null);
  return metadataFromSeo(seo, { title: 'Collection', path: `/collections/${slug}` });
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCollectionProducts(slug).catch(() => null);

  if (!data) notFound();

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Collections', href: '/collections' },
    { label: data.collection.name, href: `/collections/${data.collection.slug}` },
  ];

  return (
    <section className="py-8 sm:py-12">
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
      {data.items.length ? (
        <JsonLd
          data={itemListJsonLd(
            data.items.map((p) => ({ name: p.name, href: `/products/${p.slug}` })),
          )}
        />
      ) : null}
      <TrackView type="COLLECTION_VIEW" collectionId={data.collection.id} />
      <Container>
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mb-7 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
            Collection
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#17201d] sm:text-4xl">
            {data.collection.name}
          </h1>
          {data.collection.description ? (
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              {data.collection.description}
            </p>
          ) : null}
        </div>
        <ProductGrid products={data.items} />
      </Container>
    </section>
  );
}
