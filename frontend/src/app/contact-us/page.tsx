import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/common/Container';
import { ContactForm } from '@/components/contact/ContactForm';
import { absoluteUrl } from '@/lib/utils/seo';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact Enchanted Energy Store for product, order, and support questions.',
  alternates: { canonical: absoluteUrl('/contact-us') },
};

const HIGHLIGHTS = [
  'Order and shipping support',
  'Product and sizing guidance',
  'Wholesale and partnership enquiries',
];

export default function ContactUsPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <Image
              src="/logo.png"
              alt="Enchanted Energy Store"
              width={80}
              height={80}
              className="h-16 w-16 object-contain sm:h-20 sm:w-20"
            />
            <h1 className="mt-4 text-3xl font-semibold text-[#17201d] sm:text-4xl">
              Contact Us
            </h1>
            <p className="mt-5 text-base leading-7 text-[var(--muted)]">
              For product questions, order support, or partnership enquiries, fill
              in the form or reach us at enchantedenergystore@gmail.com.
            </p>
            <ul className="mt-6 grid gap-2 text-sm font-medium text-[#17201d]">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span aria-hidden="true" className="text-[var(--accent)]">
                    ✦
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#17201d]">Send Us a Message</h2>
            <ContactForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
