'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { ProductImage } from '@/lib/types/product.types';
import { resolveImageUrl } from '@/lib/utils/image-url';
import { SafeProductImage } from './SafeProductImage';

function detailSrc(image?: ProductImage | null) {
  return image?.detailUrl ?? image?.cardUrl ?? image?.imageUrl ?? null;
}

export function ProductImageGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [selected, setSelected] = useState(0);
  const current = images[selected] ?? images[0];
  const src = detailSrc(current);

  return (
    <div className="grid gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--soft)]">
        <SafeProductImage
          src={src}
          alt={current?.altText ?? productName}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((image, index) => {
            const thumb = image.thumbnailUrl ?? image.cardUrl ?? image.imageUrl;
            return (
              <button
                key={`${thumb}-${index}`}
                type="button"
                onClick={() => setSelected(index)}
                className={`relative aspect-square overflow-hidden rounded-md border bg-white ${
                  selected === index ? 'border-[var(--brand)]' : 'border-[var(--border)]'
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={resolveImageUrl(thumb)}
                  alt={image.altText ?? productName}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
