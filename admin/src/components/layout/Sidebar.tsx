'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/collections', label: 'Collections' },
  { href: '/services', label: 'Services' },
  { href: '/service-bookings', label: 'Service Bookings' },
  { href: '/orders', label: 'Orders' },
  { href: '/coupons', label: 'Coupons' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/guides', label: 'Guides' },
  { href: '/faqs', label: 'FAQs' },
  { href: '/seo', label: 'SEO' },
  { href: '/contact-leads', label: 'Contact Leads' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            isActive(pathname, item.href)
              ? 'bg-[var(--brand)] text-white'
              : 'text-[var(--heading)] hover:bg-[var(--soft)]'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Persistent sidebar on md+ */}
      <aside className="hidden w-56 shrink-0 border-r border-[var(--border)] bg-white p-4 md:block">
        <p className="mb-4 px-3 text-lg font-semibold text-[var(--heading)]">EES Admin</p>
        <NavLinks />
      </aside>

      {/* Mobile: hamburger + dropdown panel, matching the storefront's MobileNav idiom */}
      <div className="relative border-b border-[var(--border)] bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-lg font-semibold text-[var(--heading)]">EES Admin</p>
          <button
            type="button"
            aria-expanded={open}
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
            className="min-h-11 min-w-11 rounded-md border border-[var(--border)] px-3 text-sm font-semibold"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
        {open ? (
          <div className="absolute left-0 right-0 top-full z-30 border-y border-[var(--border)] bg-white p-2 shadow-sm">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        ) : null}
      </div>
    </>
  );
}
