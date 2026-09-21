import type { ProductStatus, StockStatus } from './product.types';

export type InventoryProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  status: ProductStatus;
  stockStatus: StockStatus;
  inventoryQuantity: number;
  lowStockThreshold: number;
  updatedAt: string;
};

export type UpdateInventoryInput = { inventoryQuantity: number; lowStockThreshold: number };
