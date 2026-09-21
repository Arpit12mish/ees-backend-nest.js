import type { ReactNode } from 'react';
import Image from 'next/image';

export function LegalPageHeader({
  title,
  lastUpdated,
}: {
  title: string;
  lastUpdated: string;
}) {
  return (
    <div>
      <Image
        src="/logo.png"
        alt="Enchanted Energy Store"
        width={64}
        height={64}
        className="h-14 w-14 object-contain sm:h-16 sm:w-16"
      />
      <h1 className="mt-4 text-3xl font-semibold text-[#17201d] sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Last updated: {lastUpdated}</p>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-[#17201d]">{title}</h2>
      <div className="mt-3 grid gap-3 text-base leading-7 text-[var(--muted)]">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="grid list-disc gap-2 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
