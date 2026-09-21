import type { Metadata } from 'next';
import { Container } from '@/components/common/Container';
import { LegalPageHeader, LegalSection } from '@/components/legal/LegalPage';
import { absoluteUrl } from '@/lib/utils/seo';

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: 'Shipping policy for Enchanted Energy Store orders.',
  alternates: { canonical: absoluteUrl('/shipping-policy') },
};

export default function ShippingPolicyPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <LegalPageHeader title="Shipping Policy" lastUpdated="20 September 2026" />

        <div className="mt-6 grid gap-3 text-base leading-7 text-[var(--muted)]">
          <p>
            This Shipping Policy explains how we process, dispatch, and deliver
            orders placed on the Enchanted Energy Store website. All orders are
            shipped through Shiprocket, our courier partner.
          </p>
        </div>

        <LegalSection title="1. Dispatch Time">
          <p>
            Orders are generally dispatched within{' '}
            <strong className="text-[#17201d]">10 working days</strong> from the
            date of order confirmation.
          </p>
        </LegalSection>

        <LegalSection title="2. Delivery Time">
          <p>
            Once shipped, orders are generally delivered within{' '}
            <strong className="text-[#17201d]">3–4 days</strong>, depending on the
            delivery location and courier service.
          </p>
        </LegalSection>

        <LegalSection title="3. Possible Delays">
          <p>
            Delivery timelines may occasionally be affected by holidays, weather,
            courier delays, or other unforeseen circumstances.
          </p>
        </LegalSection>

        <LegalSection title="4. Order Updates">
          <p>
            Customers will receive shipping/order updates through the contact
            details provided during checkout.
          </p>
        </LegalSection>

        <LegalSection title="5. Shipping Address">
          <p>
            Please ensure that the shipping address and contact details provided
            are accurate to avoid delivery issues.
          </p>
        </LegalSection>

        <LegalSection title="6. Shipping Charges">
          <p>
            Free shipping applies on orders above ₹499. A flat shipping charge of
            ₹49 applies to orders below ₹499, calculated automatically at
            checkout.
          </p>
        </LegalSection>

        <LegalSection title="Contact Us">
          <p>
            For any shipping-related questions or to report a delayed order,
            please contact us at{' '}
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
