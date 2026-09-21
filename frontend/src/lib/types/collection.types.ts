import type { ProductCardProduct } from './product.types';
import type { Paginated } from './common.types';

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  priority: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CollectionProductsResponse = Paginated<ProductCardProduct> & {
  collection: Collection;
};
