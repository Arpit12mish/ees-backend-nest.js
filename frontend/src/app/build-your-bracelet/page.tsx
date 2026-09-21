import type { Metadata } from 'next';
import { Container } from '@/components/common/Container';
import { CustomBraceletForm } from '@/components/contact/CustomBraceletForm';

export const metadata: Metadata = {
  title: 'Build Your Custom Bracelet',
  description:
    'Design your own custom crystal bracelet with Enchanted Energy Store — choose your stones, bead size, and wrist size, and our team will craft it for you.',
};

const HIGHLIGHTS = [
  'Design your own crystal bracelet online',
  'Fully personalized to your style and intention',
  'Natural, authentic crystals and stones',
  'Handmade custom bracelets for everyone',
];

export default function BuildYourBraceletPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <h1 className="text-3xl font-semibold text-[#17201d] sm:text-4xl">
              Build Your Custom Bracelet
            </h1>
            <div className="mt-5 grid gap-4 text-base leading-7 text-[var(--muted)]">
              <p>
                Want a crystal bracelet made exactly the way you imagine it? With
                Enchanted Energy Store, you can create your own custom bracelet by
                simply sharing your requirements with us.
              </p>
              <p>
                Choose the natural crystal beads you&apos;d like, let us know your
                preferred bead size, and share your wrist size for a comfortable
                fit. Whether you&apos;re looking for a bracelet traditionally
                associated with healing, positivity, protection, or prosperity,
                or something made purely for gifting, we&apos;ll help bring it to
                life.
              </p>
              <p>
                Once you submit your details below, our team will get in touch to
                guide you through the design and finalize it with you. Every
                bracelet is handmade with natural crystals to keep each piece
                unique.
              </p>
            </div>
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
            <h2 className="text-lg font-semibold text-[#17201d]">
              Submit Your Custom Bracelet Requirement
            </h2>
            <div className="mt-4">
              <CustomBraceletForm />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
