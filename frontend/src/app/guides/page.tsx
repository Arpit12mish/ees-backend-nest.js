import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { ErrorState } from '@/components/common/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { SectionHeading } from '@/components/common/SectionHeading';
import { SafeProductImage } from '@/components/products/SafeProductImage';
import { JsonLd } from '@/components/seo/JsonLd';
import { getGuides } from '@/lib/api/guides.api';
import { absoluteUrl, itemListJsonLd } from '@/lib/utils/seo';

export const metadata: Metadata = {
  title: 'Guides',
  description:
    'Learn about crystals, chakras, and mindful energy practices with guides traditionally associated with healing, balance, and intentional living.',
  alternates: { canonical: absoluteUrl('/guides') },
};

export default async function GuidesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const page = typeof params.page === 'string' ? Number(params.page) : 1;
  const data = await getGuides({ page }).catch(() => null);
  const items = data?.items ?? [];

  return (
    <section className="py-8 sm:py-12">
      <Container>
        {items.length ? (
          <JsonLd
            data={itemListJsonLd(items.map((g) => ({ name: g.title, href: `/guides/${g.slug}` })))}
          />
        ) : null}
        <SectionHeading
          title="Guides"
          description="Crystal meanings, chakra basics, and mindful energy practices."
        />
        {!data ? (
          <ErrorState description="Guides could not be loaded." />
        ) : items.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No guides published yet.</p>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.slug}`}
                  className="overflow-hidden rounded-lg border border-[var(--border)] bg-white hover:border-[var(--brand)]"
                >
                  {guide.coverImageUrl ? (
                    <div className="relative aspect-[16/9] w-full">
                      <SafeProductImage src={guide.coverImageUrl} alt={guide.title} sizes="(max-width: 1024px) 100vw, 33vw" />
                    </div>
                  ) : null}
                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-[#17201d]">{guide.title}</h2>
                    {guide.excerpt ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
                        {guide.excerpt}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              buildHref={(p) => `/guides?page=${p}`}
            />
          </>
        )}
      </Container>
    </section>
  );
}
