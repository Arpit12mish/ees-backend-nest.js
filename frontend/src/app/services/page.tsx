import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { SafeProductImage } from '@/components/products/SafeProductImage';
import { getServices } from '@/lib/api/services.api';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Book mindful energy services from Enchanted Energy Store.',
};

export default async function ServicesPage() {
  const services = await getServices().catch(() => null);

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <h1 className="font-display text-3xl font-medium text-[#111111] sm:text-4xl">
          Services
        </h1>
        <p className="mt-3 text-base leading-7 text-[var(--muted)]">
          Book a mindful energy service with our team.
        </p>

        {!services ? (
          <div className="mt-6">
            <ErrorState description="Services could not be loaded." />
          </div>
        ) : services.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No services yet" description="Check back soon." />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="group overflow-hidden rounded-xl border border-[var(--border)] hover:border-[#111111]"
              >
                <div className="relative aspect-square w-full">
                  <SafeProductImage
                    src={service.imageUrl}
                    alt={service.name}
                    sizes="(max-width: 640px) 90vw, 30vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-[#111111]">{service.name}</h2>
                  {service.description ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                      {service.description}
                    </p>
                  ) : null}
                  {service.priceLabel ? (
                    <p className="mt-2 text-sm font-semibold text-[var(--accent)]">
                      {service.priceLabel}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
