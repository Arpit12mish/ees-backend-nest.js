'use client';

import Link from 'next/link';
import { useState } from 'react';

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

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Toggle navigation"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[#111111] bg-white text-sm font-semibold text-[#111111]"
      >
        <span className="sr-only">Menu</span>
        <span aria-hidden="true">{open ? 'Close' : 'Menu'}</span>
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-full border-y border-[#111111] bg-white shadow-sm">
          <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base font-medium text-[#111111] hover:bg-[var(--soft)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
