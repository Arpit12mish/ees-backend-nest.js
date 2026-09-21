import type { Metadata } from 'next';

// The page itself is a client component (needs checkout form state/hooks),
// so metadata can't be exported from page.tsx directly — this server layout
// carries it instead. robots.txt disallows /checkout from being crawled, but
// that alone doesn't stop Google indexing the bare URL if linked from
// elsewhere; an explicit noindex is the only way to guarantee it stays out.
export const metadata: Metadata = {
  title: 'Checkout',
  robots: 'noindex, nofollow',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
