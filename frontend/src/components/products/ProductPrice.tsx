import { formatPrice } from '@/lib/utils/format-price';

export function ProductPrice({
  price,
  mrp,
  discountPercent,
  currency = 'INR',
}: {
  price: number;
  mrp?: number;
  discountPercent?: number;
  currency?: string;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="text-base font-semibold text-[#17201d] sm:text-lg">
        {formatPrice(price, currency)}
      </span>
      {mrp && mrp > price ? (
        <span className="text-sm text-[var(--muted)] line-through">
          {formatPrice(mrp, currency)}
        </span>
      ) : null}
      {discountPercent && discountPercent > 0 ? (
        <span className="rounded-full bg-[#f1eadb] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
          {Math.round(discountPercent)}% off
        </span>
      ) : null}
    </div>
  );
}
