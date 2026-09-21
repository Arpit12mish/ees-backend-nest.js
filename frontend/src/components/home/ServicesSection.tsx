import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { Reveal } from '@/components/animations/Reveal';
import { SafeProductImage } from '@/components/products/SafeProductImage';
import type { Service } from '@/lib/types/service.types';

export function ServicesSection({ services }: { services: Service[] }) {
  const featured = services.slice(0, 4);
  if (featured.length === 0) return null;

  return (
    <section className="border-t border-[var(--border)] bg-white py-16 sm:py-20">
      <Container>
        <h2 className="text-center font-display text-3xl font-medium sm:text-4xl">
          Services
        </h2>

        <Reveal
          stagger={0.08}
          y={20}
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {featured.map((service) => (
            <div
              key={service.id}
              className="flex flex-col overflow-hidden rounded-xl border border-[var(--border)]"
            >
              <div className="relative aspect-square w-full">
                <SafeProductImage
                  src={service.imageUrl}
                  alt={service.name}
                  sizes="(max-width: 640px) 90vw, 22vw"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="font-semibold text-[#111111]">{service.name}</h3>
                {service.description ? (
                  <p className="line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                    {service.description}
                  </p>
                ) : null}
                {service.priceLabel ? (
                  <p className="text-sm font-semibold text-[var(--accent)]">
                    {service.priceLabel}
                  </p>
                ) : null}
                <Link
                  href={`/services/${service.slug}`}
                  className="mt-auto inline-flex min-h-10 items-center justify-center rounded-md border border-[#111111] px-4 text-sm font-semibold hover:bg-[#111111] hover:text-white"
                >
                  Book
                </Link>
              </div>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
