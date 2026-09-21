import type { ProductImage, ProductStatus } from './product.types';

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { collectionProducts: number };
};

export type CollectionProductSummary = {
  id: string;
  collectionId: string;
  productId: string;
  sortOrder: number;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    status: ProductStatus;
    images: Pick<ProductImage, 'imageUrl' | 'thumbnailUrl' | 'isPrimary'>[];
  };
};

export type CollectionDetail = Collection & {
  collectionProducts: CollectionProductSummary[];
};

export type CollectionInput = {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  priority?: number;
  isActive?: boolean;
};

export type AddCollectionProductInput = { productId: string; sortOrder?: number };
export type BulkAddCollectionProductsInput = { productIds: string[] };
export type BulkAddResult = { added: number; skipped: number };
