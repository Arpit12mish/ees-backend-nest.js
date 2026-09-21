import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/common/Container';

export function Footer() {
  return (
    <footer className="border-t border-[#111111] bg-white text-[#111111]">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Enchanted Energy Store"
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 object-contain"
            />
            <h2 className="font-display text-lg font-medium">Enchanted Energy Store</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Crystals, stones, and mindful energy products traditionally
            associated with positivity, balance, protection, and intentional
            living.
          </p>
          <a
            href="https://www.instagram.com/enchanted_energy_store/"
            target="_blank"
            rel="me noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#111111] hover:text-[var(--accent)]"
          >
            Follow us on Instagram
          </a>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Quick links
          </h3>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/products" className="hover:text-[var(--accent)]">Products</Link>
            <Link href="/categories" className="hover:text-[var(--accent)]">Categories</Link>
            <Link href="/collections" className="hover:text-[var(--accent)]">Collections</Link>
            <Link href="/guides" className="hover:text-[var(--accent)]">Guides</Link>
            <Link href="/build-your-bracelet" className="hover:text-[var(--accent)]">Custom Bracelet</Link>
            <Link href="/about-us" className="hover:text-[var(--accent)]">About</Link>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Services
          </h3>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/services" className="hover:text-[var(--accent)]">All services</Link>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Categories
          </h3>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/products?search=crystal" className="hover:text-[var(--accent)]">Crystals</Link>
            <Link href="/products?search=bracelet" className="hover:text-[var(--accent)]">Bracelets</Link>
            <Link href="/products?search=protection" className="hover:text-[var(--accent)]">Protection</Link>
            <Link href="/products?search=prosperity" className="hover:text-[var(--accent)]">Prosperity</Link>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Support
          </h3>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/contact-us" className="hover:text-[var(--accent)]">Contact</Link>
            <Link href="/faq" className="hover:text-[var(--accent)]">FAQ</Link>
            <Link href="/privacy-policy" className="hover:text-[var(--accent)]">Privacy policy</Link>
            <Link href="/terms-and-conditions" className="hover:text-[var(--accent)]">Terms and conditions</Link>
            <Link href="/shipping-policy" className="hover:text-[var(--accent)]">Shipping policy</Link>
            <Link href="/cancellation-and-refund-policy" className="hover:text-[var(--accent)]">Cancellation &amp; refund policy</Link>
            <p className="text-[var(--muted)]">enchantedenergystore@gmail.com</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
