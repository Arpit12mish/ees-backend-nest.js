import type { Metadata } from 'next';
import { Container } from '@/components/common/Container';
import { LegalPageHeader, LegalSection } from '@/components/legal/LegalPage';
import { absoluteUrl } from '@/lib/utils/seo';

export const metadata: Metadata = {
  title: 'Cancellation and Refund Policy',
  description: 'Cancellation and refund policy for Enchanted Energy Store orders.',
  alternates: { canonical: absoluteUrl('/cancellation-and-refund-policy') },
};

export default function CancellationAndRefundPolicyPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <LegalPageHeader
          title="Cancellation and Refund Policy"
          lastUpdated="20 September 2026"
        />

        <div className="mt-6 grid gap-3 text-base leading-7 text-[var(--muted)]">
          <p>
            This policy explains how order cancellations and refunds work at
            Enchanted Energy Store.
          </p>
        </div>

        <LegalSection title="1. Order Cancellation">
          <p>
            Order cancellation is allowed only before the order is shipped. Once
            an order has been shipped, it cannot be cancelled. To cancel an order,
            contact us as soon as possible with your order number.
          </p>
        </LegalSection>

        <LegalSection title="2. Refund Eligibility">
          <p>
            Refunds are applicable only if the product is received damaged. We do
            not offer refunds or exchanges for reasons such as a change of mind.
          </p>
        </LegalSection>

        <LegalSection title="3. Unboxing Video Requirement">
          <p>
            To claim a refund for a damaged product, the customer must make a
            clear, continuous unboxing/opening video showing the sealed package
            and the damaged product. The unboxing video must be provided as proof
            when requesting a refund — requests without a valid unboxing video
            cannot be processed.
          </p>
        </LegalSection>

        <LegalSection title="4. Refund Processing">
          <p>
            After verification of the damage and required proof, the eligible
            refund will be processed according to our refund procedure, back to
            your original payment method.
          </p>
        </LegalSection>

        <LegalSection title="5. How to Request a Cancellation or Refund">
          <p>
            Email us at{' '}
            <a href="mailto:enchantedenergystore@gmail.com" className="text-[var(--accent)]">
              enchantedenergystore@gmail.com
            </a>{' '}
            with your order number, and for damaged items, your unboxing video.
            Our team will guide you through the next steps.
          </p>
        </LegalSection>
      </Container>
    </section>
  );
}
