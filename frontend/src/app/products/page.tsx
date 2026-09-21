import type { Metadata } from 'next';
import { Container } from '@/components/common/Container';
import { ErrorState } from '@/components/common/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProductGrid } from '@/components/products/ProductGrid';
import { JsonLd } from '@/components/seo/JsonLd';
import { TrackView } from '@/components/analytics/TrackView';
import { getProducts, searchProducts } from '@/lib/api/products.api';
import { absoluteUrl, itemListJsonLd } from '@/lib/utils/seo';

export const metadata: Metadata = {
  title: 'Shop Products',
  description:
    'Browse crystals, stones, bracelets, pyramids, candles, and mindful energy products traditionally associated with intentional living.',
  alternates: { canonical: absoluteUrl('/products') },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const q =
    typeof params.q === 'string'
      ? params.q
      : typeof params.search === 'string'
        ? params.search
        : undefined;
  const page = typeof params.page === 'string' ? Number(params.page) : 1;

  let data = null;
  try {
    data = q
      ? await searchProducts(q, page)
      : await getProducts({ page, sort: 'priority' });
  } catch {
    data = null;
  }

  function buildHref(targetPage: number) {
    const qs = new URLSearchParams();
    if (q) qs.set('q', q);
    qs.set('page', String(targetPage));
    return `/products?${qs.toString()}`;
  }

  return (
    <section className="py-8 sm:py-12">
      <Container>
        {data?.items.length ? (
          <JsonLd
            data={itemListJsonLd(
              data.items.map((p) => ({ name: p.name, href: `/products/${p.slug}` })),
            )}
          />
        ) : null}
        {data ? (
          <>
            {q ? <TrackView type="SEARCH" searchQuery={q} resultCount={data.meta.total} /> : null}
            <SectionHeading
              title={q ? `Search results for "${q}"` : 'Shop all products'}
              description="Explore crystals, stones, bracelets, candles, cleansing products, and energy products often chosen for mindful routines."
            />
            <ProductGrid products={data.items} />
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              buildHref={buildHref}
            />
          </>
        ) : (
          <ErrorState description="Products could not be loaded. Please confirm the backend is running." />
        )}
      </Container>
    </section>
  );
}
