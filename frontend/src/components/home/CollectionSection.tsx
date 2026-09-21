import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Reveal } from '@/components/animations/Reveal';
import type { Collection } from '@/lib/types/collection.types';

export function CollectionSection({ collections }: { collections: Collection[] }) {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Curated collections"
            title="Thoughtful product groupings"
            description="Collections help you explore products often chosen for positivity, love, prosperity, protection, and cleansing practices."
          />
        </Reveal>
        <Reveal stagger={0.1} y={20} className="grid gap-4 md:grid-cols-3">
          {collections.slice(0, 6).map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="rounded-lg bg-[#17201d] p-5 text-white hover:bg-[#23312d]"
            >
              <h3 className="text-lg font-semibold">{collection.name}</h3>
              {collection.description ? (
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/75">
                  {collection.description}
                </p>
              ) : null}
            </Link>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
