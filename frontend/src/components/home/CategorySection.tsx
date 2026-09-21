import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Reveal } from '@/components/animations/Reveal';
import type { Category } from '@/lib/types/category.types';

export function CategorySection({ categories }: { categories: Category[] }) {
  return (
    <section className="bg-white py-12 sm:py-16">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Shop by category"
            title="Find products by intention and form"
            description="Browse categories for crystals, bracelets, pyramids, candles, cleansing products, protection products, and more."
          />
        </Reveal>
        <Reveal stagger={0.08} y={20} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="rounded-lg border border-[var(--border)] bg-[#fffdf8] p-4 hover:border-[var(--brand)]"
            >
              <h3 className="font-semibold text-[#17201d]">{category.name}</h3>
              {category.description ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                  {category.description}
                </p>
              ) : null}
            </Link>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
