import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/common/Container';
import { absoluteUrl } from '@/lib/utils/seo';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Enchanted Energy Store and our safe, mindful approach to crystals, stones, and energy products.',
  alternates: { canonical: absoluteUrl('/about-us') },
};

export default function AboutUsPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <Image
          src="/logo.png"
          alt="Enchanted Energy Store"
          width={80}
          height={80}
          className="h-16 w-16 object-contain sm:h-20 sm:w-20"
        />
        <h1 className="mt-4 text-3xl font-semibold text-[#17201d]">About Us</h1>
        <div className="mt-5 grid gap-4 text-base leading-7 text-[var(--muted)]">
          <p>
            Enchanted Energy Store curates crystals, natural stones, bracelets,
            pyramids, candles, and cleansing products for mindful spaces and
            intentional routines.
          </p>
          <p>
            Our descriptions focus on traditional associations, symbolic
            meanings, and common uses. We do not make medical claims or
            guarantee spiritual outcomes.
          </p>
        </div>
      </Container>
    </section>
  );
}
