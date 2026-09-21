import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/common/Container';

// robots.txt disallows this path from being crawled, but that alone doesn't
// stop Google indexing the bare URL if it's linked from elsewhere — an
// explicit noindex is the only way to guarantee it stays out of results.
export const metadata: Metadata = {
  title: 'Order Confirmed',
  robots: 'noindex, nofollow',
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const orderNumber = typeof params.orderNumber === 'string' ? params.orderNumber : '';

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="mx-auto max-w-2xl rounded-lg border border-[var(--border)] bg-white p-6 text-center sm:p-8">
          <h1 className="text-3xl font-semibold text-[#17201d]">Order confirmed</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Thank you. Your mock payment was verified and your order has been
            confirmed.
          </p>
          {orderNumber ? (
            <p className="mt-4 rounded-md bg-[var(--soft)] px-4 py-3 text-sm font-semibold text-[#17201d]">
              Order number: {orderNumber}
            </p>
          ) : null}
          <Link
            href="/products"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white"
          >
            Continue shopping
          </Link>
        </div>
      </Container>
    </section>
  );
}
