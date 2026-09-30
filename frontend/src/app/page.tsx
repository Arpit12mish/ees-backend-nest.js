import type { Metadata } from 'next';
import { BestSellers } from '@/components/home/BestSellers';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { HeroSection } from '@/components/home/HeroSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { getCategories } from '@/lib/api/categories.api';
import { getFeaturedProducts } from '@/lib/api/products.api';
import { getServices } from '@/lib/api/services.api';
import { getHeroReels } from '@/lib/api/hero-reels.api';

export const metadata: Metadata = {
  title: 'Crystals, Stones, and Mindful Energy Products',
  description:
    'Discover crystals, stones, and mindful energy products traditionally associated with positivity, balance, protection, and intentional living.',
};

export default async function HomePage() {
  const [categoriesPage, services, bestSellers, heroReels] = await Promise.all([
    getCategories().catch(() => ({ items: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } })),
    getServices().catch(() => []),
    getFeaturedProducts().catch(() => []),
    getHeroReels().catch(() => []),
  ]);

  return (
    <>
      <HeroSection reels={heroReels} />
      <CategoryShowcase categories={categoriesPage.items} />
      <BestSellers products={bestSellers} />
      <ServicesSection services={services} />
    </>
  );
}
