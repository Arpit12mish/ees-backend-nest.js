import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/common/Container';
import { SafeProductImage } from '@/components/products/SafeProductImage';
import { ServiceBookingForm } from '@/components/services/ServiceBookingForm';
import { getService } from '@/lib/api/services.api';
import { getServiceSeo } from '@/lib/api/seo.api';
import { metadataFromSeo } from '@/lib/utils/seo';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getServiceSeo(slug).catch(() => null);
  return metadataFromSeo(seo, { title: 'Service', path: `/services/${slug}` });
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getService(slug).catch(() => null);
  if (!service) notFound();

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-[var(--border)]">
              <SafeProductImage
                src={service.imageUrl}
                alt={service.name}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <h1 className="mt-6 font-display text-3xl font-medium text-[#111111] sm:text-4xl">
              {service.name}
            </h1>
            {service.priceLabel ? (
              <p className="mt-2 text-lg font-semibold text-[var(--accent)]">
                {service.priceLabel}
              </p>
            ) : null}
            {service.description ? (
              <p className="mt-4 text-base leading-7 text-[var(--muted)]">
                {service.description}
              </p>
            ) : null}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#111111]">Book this service</h2>
            <div className="mt-4">
              <ServiceBookingForm serviceId={service.id} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
