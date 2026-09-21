import type { ProductCardProduct } from '@/lib/types/product.types';
import { EmptyState } from '@/components/common/EmptyState';
import { Reveal } from '@/components/animations/Reveal';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products }: { products: ProductCardProduct[] }) {
  if (!products.length) {
    return (
      <EmptyState
        title="No products found"
        description="Please check back soon for more crystals, stones, and mindful energy products."
      />
    );
  }

  return (
    <Reveal
      stagger={0.06}
      y={20}
      className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 min-[360px]:gap-4 sm:grid-cols-3 lg:grid-cols-4"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Reveal>
  );
}
