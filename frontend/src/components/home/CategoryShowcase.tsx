import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { Reveal } from '@/components/animations/Reveal';
import { SafeProductImage } from '@/components/products/SafeProductImage';
import type { Category } from '@/lib/types/category.types';

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  const featured = categories.slice(0, 4);
  if (featured.length === 0) return null;

  return (
    <section className="bg-white py-16 sm:py-20">
      <Container>
        <Reveal
          stagger={0.08}
          y={20}
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        >
          {featured.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-[var(--border)]"
            >
              <SafeProductImage
                src={category.imageUrl}
                alt={category.name}
                sizes="(max-width: 640px) 45vw, 22vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-sm font-semibold text-white">
                {category.name}
              </span>
            </Link>
          ))}
        </Reveal>

        <Reveal>
          <h2 className="mt-12 text-center font-display text-3xl font-medium leading-tight sm:text-4xl">
            Every positive does a world of good.
          </h2>
        </Reveal>

        <div className="mt-10 flex items-center justify-between border-t border-[#111111] pt-4 text-xs font-semibold uppercase tracking-[0.12em]">
          <span>Buy good</span>
          <span>Be positive</span>
        </div>
      </Container>
    </section>
  );
}
