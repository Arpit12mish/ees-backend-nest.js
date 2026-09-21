import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { LegalPageHeader, LegalSection } from '@/components/legal/LegalPage';
import { absoluteUrl } from '@/lib/utils/seo';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Terms and conditions for Enchanted Energy Store.',
  alternates: { canonical: absoluteUrl('/terms-and-conditions') },
};

export default function TermsAndConditionsPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <LegalPageHeader title="Terms and Conditions" lastUpdated="20 September 2026" />

        <div className="mt-6 grid gap-3 text-base leading-7 text-[var(--muted)]">
          <p>
            These Terms and Conditions govern your use of the Enchanted Energy
            Store website and your purchase of any products from us.
          </p>
        </div>

        <LegalSection title="1. Acceptance of Policies">
          <p>
            By placing an order, you agree to our store policies, including our{' '}
            <Link href="/shipping-policy" className="text-[var(--accent)]">
              Shipping Policy
            </Link>{' '}
            and{' '}
            <Link href="/cancellation-and-refund-policy" className="text-[var(--accent)]">
              Cancellation and Refund Policy
            </Link>
            .
          </p>
        </LegalSection>

        <LegalSection title="2. Product Representation">
          <p>
            Product images are for representation purposes; natural stones may
            vary slightly in color, pattern, and appearance.
          </p>
        </LegalSection>

        <LegalSection title="3. Accuracy of Information">
          <p>
            Customers are responsible for providing accurate shipping and contact
            details while placing an order.
          </p>
        </LegalSection>

        <LegalSection title="4. Order Confirmation">
          <p>Orders are subject to availability and confirmation by the store.</p>
        </LegalSection>

        <LegalSection title="5. Changes to Products, Prices and Policies">
          <p>
            We reserve the right to update product details, prices, and policies
            when required.
          </p>
        </LegalSection>

        <LegalSection title="Contact Us">
          <p>
            For questions about these Terms, please contact us at{' '}
            <a href="mailto:enchantedenergystore@gmail.com" className="text-[var(--accent)]">
              enchantedenergystore@gmail.com
            </a>
            .
          </p>
        </LegalSection>
      </Container>
    </section>
  );
}
