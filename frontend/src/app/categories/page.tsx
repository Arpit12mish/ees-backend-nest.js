import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { ErrorState } from '@/components/common/ErrorState';
import { SectionHeading } from '@/components/common/SectionHeading';
import { getCategories } from '@/lib/api/categories.api';
import { absoluteUrl } from '@/lib/utils/seo';

export const metadata: Metadata = {
  title: 'Categories',
  description:
    'Browse crystals, bracelets, pyramids, candles, cleansing products, protection products, and other mindful energy categories.',
  alternates: { canonical: absoluteUrl('/categories') },
};

export default async function CategoriesPage() {
  const data = await getCategories().catch(() => null);

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <SectionHeading
          title="Shop by category"
          description="Find products by form, tradition, and intention."
        />
        {!data ? (
          <ErrorState description="Categories could not be loaded." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="rounded-lg border border-[var(--border)] bg-white p-5 hover:border-[var(--brand)]"
              >
                <h2 className="text-lg font-semibold text-[#17201d]">{category.name}</h2>
                {category.description ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
                    {category.description}
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
