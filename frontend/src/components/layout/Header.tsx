import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { CartLink } from './CartLink';
import { HeaderSearch } from './HeaderSearch';
import { MobileNav } from './MobileNav';

const links = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/collections', label: 'Collections' },
  { href: '/services', label: 'Services' },
  { href: '/build-your-bracelet', label: 'Custom Bracelet' },
  { href: '/about-us', label: 'About' },
  { href: '/contact-us', label: 'Contact' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#111111] bg-white/95 backdrop-blur">
      <Container className="relative flex min-h-16 items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2">
          <Image
            src="/logo.png"
            alt="Enchanted Energy Store"
            width={40}
            height={40}
            className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
            priority
          />
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-bold tracking-wide text-[#111111] min-[360px]:text-lg">
              Enchanted
            </span>
            <span className="hidden text-s text-[var(--muted)] font-normal min-[360px]:block">
              Energy Store
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-[#111111] md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[var(--accent)]">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <HeaderSearch />
          <CartLink />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
