import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { SafeProductImage } from '@/components/products/SafeProductImage';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { BestSellersArrows } from './BestSellersArrows';
import { formatPrice } from '@/lib/utils/format-price';
import type { ProductCardProduct } from '@/lib/types/product.types';

function cardImage(product: ProductCardProduct) {
  const image = product.primaryImage ?? product.images?.[0];
  return image?.cardUrl ?? image?.thumbnailUrl ?? image?.imageUrl ?? null;
}

export function BestSellers({ products }: { products: ProductCardProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-[var(--border)] bg-white py-16 sm:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Best Sellers
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium leading-tight sm:text-4xl">
              Our most gifted picks for good vibes
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/collections/best-sellers"
              className="text-xs font-semibold uppercase tracking-[0.1em] hover:text-[var(--accent)]"
            >
              View all
            </Link>
            <BestSellersArrows />
          </div>
        </div>

        <div
          id="best-sellers-scroll"
          className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => {
            const image = cardImage(product);
            const outOfStock = product.stockStatus === 'OUT_OF_STOCK';

            return (
              <article
                key={product.id}
                className="w-[70%] shrink-0 snap-start sm:w-[45%] lg:w-[23%]"
              >
                <div className="group relative aspect-square w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--soft)]">
                  {product.badge ? (
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#111111] shadow-sm">
                      {product.badge}
                    </span>
                  ) : null}
                  <div className="absolute right-3 top-3 z-10">
                    <AddToCartButton
                      productId={product.id}
                      disabled={outOfStock}
                      variant="icon"
                    />
                  </div>
                  <Link href={`/products/${product.slug}`} className="block h-full w-full">
                    <SafeProductImage
                      src={image}
                      alt={product.primaryImage?.altText ?? product.name}
                      sizes="(max-width: 640px) 70vw, (max-width: 1024px) 45vw, 23vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                </div>

                <Link href={`/products/${product.slug}`} className="mt-4 block">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#111111] sm:text-base">
                    {product.name}
                  </h3>
                </Link>
                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-semibold text-[#111111] sm:text-base">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  {product.mrp > product.price ? (
                    <span className="text-xs text-[var(--muted)] line-through">
                      {formatPrice(product.mrp, product.currency)}
                    </span>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
