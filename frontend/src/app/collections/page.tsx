import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { ErrorState } from '@/components/common/ErrorState';
import { SectionHeading } from '@/components/common/SectionHeading';
import { getCollections } from '@/lib/api/collections.api';
import { absoluteUrl } from '@/lib/utils/seo';

export const metadata: Metadata = {
  title: 'Collections',
  description:
    'Explore curated crystal and mindful energy product collections for positivity, protection, love, prosperity, and cleansing routines.',
  alternates: { canonical: absoluteUrl('/collections') },
};

export default async function CollectionsPage() {
  const collections = await getCollections().catch(() => null);

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <SectionHeading
          title="Curated collections"
          description="Browse thoughtful groupings of crystals, stones, and energy products."
        />
        {!collections ? (
          <ErrorState description="Collections could not be loaded." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="rounded-lg bg-[#17201d] p-5 text-white hover:bg-[#23312d]"
              >
                <h2 className="text-lg font-semibold">{collection.name}</h2>
                {collection.description ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/75">
                    {collection.description}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
