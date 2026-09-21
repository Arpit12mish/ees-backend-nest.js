import Link from 'next/link';
import { Container } from '@/components/common/Container';

export default function NotFound() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-[#17201d] sm:text-4xl">Page not found</h1>
        <p className="mt-3 text-base leading-7 text-[var(--muted)]">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:opacity-90"
          >
            Back to home
          </Link>
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] px-5 text-sm font-semibold text-[#17201d] hover:border-[var(--brand)]"
          >
            Shop products
          </Link>
        </div>
      </Container>
    </section>
  );
}
