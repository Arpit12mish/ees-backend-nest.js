'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CartItem as CartItemType } from '@/lib/types/cart.types';
import { formatPrice } from '@/lib/utils/format-price';

export function CartItem({
  item,
  onUpdate,
  onRemove,
  busy,
}: {
  item: CartItemType;
  onUpdate: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  busy?: boolean;
}) {
  const image =
    item.product.primaryImage?.thumbnailUrl ??
    item.product.primaryImage?.cardUrl ??
    item.product.primaryImage?.imageUrl ??
    item.product.images?.[0]?.thumbnailUrl ??
    item.product.images?.[0]?.imageUrl;

  return (
    <div className="grid grid-cols-[88px_1fr] gap-3 rounded-lg border border-[var(--border)] bg-white p-3 sm:grid-cols-[112px_1fr_auto] sm:gap-4">
      <div className="relative aspect-square overflow-hidden rounded-md bg-[var(--soft)]">
        {image ? (
          <Image
            src={image}
            alt={item.product.primaryImage?.altText ?? item.product.name}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0">
        <Link href={`/products/${item.product.slug}`} className="font-semibold text-[#17201d]">
          <span className="line-clamp-2">{item.product.name}</span>
        </Link>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {formatPrice(item.priceAtAdd, item.product.currency)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy || item.quantity <= 1}
            onClick={() => onUpdate(item.id, item.quantity - 1)}
            className="min-h-10 min-w-10 rounded-md border border-[var(--border)] bg-white disabled:opacity-40"
          >
            -
          </button>
          <span className="min-w-8 text-center text-sm font-semibold">
            {item.quantity}
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={() => onUpdate(item.id, item.quantity + 1)}
            className="min-h-10 min-w-10 rounded-md border border-[var(--border)] bg-white"
          >
            +
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onRemove(item.id)}
            className="min-h-10 rounded-md px-3 text-sm font-semibold text-red-700"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="col-span-2 text-right text-sm font-semibold text-[#17201d] sm:col-span-1">
        {formatPrice(item.itemSubtotal, item.product.currency)}
      </div>
    </div>
  );
}
