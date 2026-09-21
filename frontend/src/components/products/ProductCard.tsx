import Link from 'next/link';
import type { ProductCardProduct } from '@/lib/types/product.types';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { ProductPrice } from './ProductPrice';
import { SafeProductImage } from './SafeProductImage';

function cardImage(product: ProductCardProduct) {
  const image = product.primaryImage ?? product.images?.[0];
  return image?.cardUrl ?? image?.thumbnailUrl ?? image?.imageUrl ?? null;
}

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const image = cardImage(product);
  const outOfStock = product.stockStatus === 'OUT_OF_STOCK';

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-white">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-[var(--soft)]">
          {product.badge ? (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#17201d] shadow-sm">
              {product.badge}
            </span>
          ) : null}
          <SafeProductImage
            src={image}
            alt={product.primaryImage?.altText ?? product.name}
            sizes="(max-width: 359px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        {product.category ? (
          <Link
            href={`/categories/${product.category.slug}`}
            className="text-xs font-medium text-[var(--accent)]"
          >
            {product.category.name}
          </Link>
        ) : null}
        <Link href={`/products/${product.slug}`} className="min-w-0">
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[#17201d] sm:text-base">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto">
          <ProductPrice
            price={product.price}
            mrp={product.mrp}
            discountPercent={product.discountPercent}
            currency={product.currency}
          />
        </div>
        <p
          className={`text-xs font-medium ${
            outOfStock ? 'text-red-700' : 'text-[var(--brand)]'
          }`}
        >
          {outOfStock
            ? 'Out of stock'
            : product.stockStatus === 'LOW_STOCK'
              ? 'Low stock'
            : 'In stock'}
        </p>
        <AddToCartButton productId={product.id} disabled={outOfStock} />
      </div>
    </article>
  );
}
