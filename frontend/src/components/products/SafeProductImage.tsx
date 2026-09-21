'use client';

import Image from 'next/image';
import { useState } from 'react';
import { resolveImageUrl } from '@/lib/utils/image-url';

export function SafeProductImage({
  src,
  alt,
  sizes,
  priority,
  className = 'object-cover',
}: {
  src?: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [available, setAvailable] = useState(Boolean(src));

  if (!src || !available) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--soft)] px-3 text-center text-xs leading-5 text-[var(--muted)]">
        Image coming soon
      </div>
    );
  }

  return (
    <Image
      src={resolveImageUrl(src)}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => setAvailable(false)}
    />
  );
}
