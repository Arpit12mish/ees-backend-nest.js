import type { Metadata } from 'next';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { FaqAccordion } from '@/components/faq/FaqAccordion';
import { getGlobalFaqs } from '@/lib/api/faqs.api';
import { absoluteUrl } from '@/lib/utils/seo';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Answers to common questions about orders, shipping, returns, and our crystals and mindful energy products.',
  alternates: { canonical: absoluteUrl('/faq') },
};

export default async function FaqPage() {
  const faqs = await getGlobalFaqs().catch(() => []);

  return (
    <section className="py-8 sm:py-12">
      <Container className="max-w-3xl">
        <SectionHeading
          title="Frequently asked questions"
          description="Orders, shipping, returns, and general questions."
        />
        {faqs.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No FAQs published yet.</p>
        ) : (
          <FaqAccordion faqs={faqs} title={null} />
        )}
      </Container>
    </section>
  );
}
