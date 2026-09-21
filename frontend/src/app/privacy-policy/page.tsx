import type { Metadata } from 'next';
import { Container } from '@/components/common/Container';
import { LegalPageHeader, LegalSection } from '@/components/legal/LegalPage';
import { absoluteUrl } from '@/lib/utils/seo';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Enchanted Energy Store.',
  alternates: { canonical: absoluteUrl('/privacy-policy') },
};

export default function PrivacyPolicyPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <LegalPageHeader title="Privacy Policy" lastUpdated="20 September 2026" />

        <div className="mt-6 grid gap-3 text-base leading-7 text-[var(--muted)]">
          <p>
            At Enchanted Energy Store, we respect your privacy and are committed to
            protecting the information you share with us.
          </p>
        </div>

        <LegalSection title="1. Information We Collect">
          <p>
            We collect only the information necessary to process your orders,
            payments, shipping, and customer support requests.
          </p>
        </LegalSection>

        <LegalSection title="2. How We Protect Your Information">
          <p>
            Your personal information is kept secure and is not sold or shared
            with unauthorized third parties.
          </p>
        </LegalSection>

        <LegalSection title="3. Payment Security">
          <p>
            Payment details are processed securely through trusted payment
            gateways. We do not store your card, UPI, or net banking details on
            our servers.
          </p>
        </LegalSection>

        <LegalSection title="4. How We Use Your Contact Details">
          <p>
            We may use your contact details to provide order updates, shipping
            information, and important service-related communication.
          </p>
        </LegalSection>

        <LegalSection title="5. Your Consent">
          <p>
            By using our website, you agree to the collection and use of
            information as described in this policy.
          </p>
        </LegalSection>

        <LegalSection title="Contact Us">
          <p>
            If you have any questions about this Privacy Policy, please contact us
            at{' '}
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
