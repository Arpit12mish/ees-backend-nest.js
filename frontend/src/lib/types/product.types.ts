import type { Category } from './category.types';
import type { SeoMetadataRecord } from './seo.types';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'INACTIVE';

export type ProductImage = {
  id?: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  cardUrl?: string | null;
  detailUrl?: string | null;
  altText?: string | null;
  title?: string | null;
  width?: number | null;
  height?: number | null;
  sortOrder?: number;
  isPrimary?: boolean;
};

export type ProductCardProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string | null;
  price: number;
  mrp: number;
  discountPercent: number;
  currency: string;
  stockStatus: StockStatus;
  attributes?: Record<string, unknown> | null;
  priority?: number;
  badge?: string | null;
  category?: Pick<Category, 'id' | 'name' | 'slug'>;
  images: ProductImage[];
  primaryImage?: ProductImage | null;
};

export type ProductDetail = ProductCardProduct & {
  longDescription?: string | null;
  storySummary?: string | null;
  spiritualBenefitSummary?: string | null;
  usageGuide?: string | null;
  careInstructions?: string | null;
  publishedAt?: string | null;
  seoMetadata?: SeoMetadataRecord | null;
};

export type ProductQuery = {
  page?: number;
  limit?: number;
  category?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'newest' | 'price_low_to_high' | 'price_high_to_low' | 'priority';
};
