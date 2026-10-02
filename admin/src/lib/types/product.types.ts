import type { Category } from './category.types';

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'INACTIVE';
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type ProductImage = {
  id: string;
  productId: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  cardUrl?: string | null;
  detailUrl?: string | null;
  storageKey?: string | null;
  storageProvider?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  altText?: string | null;
  title?: string | null;
  width?: number | null;
  height?: number | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductListItem = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  mrp: number;
  discountPercent: number;
  status: ProductStatus;
  stockStatus: StockStatus;
  inventoryQuantity: number;
  priority: number;
  badge?: string | null;
  categoryId: string;
  category?: Pick<Category, 'id' | 'name' | 'slug'>;
  images?: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export type ProductDetail = AdminProductListItem & {
  shortDescription?: string | null;
  longDescription?: string | null;
  storySummary?: string | null;
  spiritualBenefitSummary?: string | null;
  usageGuide?: string | null;
  careInstructions?: string | null;
  lowStockThreshold: number;
  attributes?: Record<string, unknown> | null;
  publishedAt?: string | null;
  images: ProductImage[];
};

export type ProductInput = {
  name: string;
  slug?: string;
  sku: string;
  shortDescription?: string;
  longDescription?: string;
  storySummary?: string;
  spiritualBenefitSummary?: string;
  usageGuide?: string;
  careInstructions?: string;
  price: number;
  mrp: number;
  discountPercent?: number;
  categoryId: string;
  priority?: number;
  badge?: string;
  inventoryQuantity?: number;
  lowStockThreshold?: number;
  attributes?: Record<string, unknown>;
};

export type AdminProductQuery = {
  status?: ProductStatus;
  includeInactive?: boolean;
  categoryId?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'price_low_to_high' | 'price_high_to_low' | 'priority';
  page?: number;
  limit?: number;
};

export type CreateProductImageInput = {
  imageUrl: string;
  thumbnailUrl?: string;
  cardUrl?: string;
  detailUrl?: string;
  storageKey?: string;
  storageProvider?: string;
  mimeType?: string;
  sizeBytes?: number;
  altText: string;
  title?: string;
  width?: number;
  height?: number;
  sortOrder?: number;
  isPrimary?: boolean;
};

export type UpdateProductImageInput = Partial<CreateProductImageInput>;
