import { JsonLd } from '@/components/seo/JsonLd';
import { faqJsonLd } from '@/lib/utils/seo';
import type { Faq } from '@/lib/types/faq.types';

export function FaqAccordion({
  faqs,
  title = 'Frequently asked questions',
}: {
  faqs: Faq[];
  title?: string | null;
}) {
  if (faqs.length === 0) return null;

  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5">
      <JsonLd data={faqJsonLd(faqs)} />
      {title ? <h2 className="text-lg font-semibold text-[#17201d]">{title}</h2> : null}
      <div className="mt-3 grid gap-2">
        {faqs.map((faq) => (
          <details key={faq.id} className="rounded-md border border-[var(--border)] p-3">
            <summary className="cursor-pointer text-sm font-semibold text-[#17201d]">
              {faq.question}
            </summary>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
