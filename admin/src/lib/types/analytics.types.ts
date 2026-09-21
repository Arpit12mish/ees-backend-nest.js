export type AnalyticsEventType =
  | 'PAGE_VIEW'
  | 'PRODUCT_VIEW'
  | 'CATEGORY_VIEW'
  | 'COLLECTION_VIEW'
  | 'SEARCH'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'CHECKOUT_STARTED'
  | 'ORDER_COMPLETED';

export type AnalyticsOverview = {
  days: number;
  uniqueVisitors: number;
  eventCounts: Record<AnalyticsEventType, number>;
  conversionRate: number;
  orders: { count: number; revenue: number };
};

export type ProductAnalyticsRow = {
  product: { id: string; name: string; slug: string; sku: string } | null;
  productId: string;
  views: number;
  addToCart: number;
  purchased: number;
};

export type ProductAnalytics = {
  days: number;
  limit: number;
  products: ProductAnalyticsRow[];
};

export type SearchAnalyticsRow = {
  query: string;
  count: number;
};

export type SearchAnalytics = {
  days: number;
  limit: number;
  topSearches: SearchAnalyticsRow[];
  zeroResultSearches: SearchAnalyticsRow[];
};

export type AbandonedCartItem = {
  id: string;
  quantity: number;
  priceAtAdd: number;
  itemSubtotal: number;
  product: { id: string; name: string; slug: string; price: number } | null;
};

export type AbandonedCart = {
  id: string;
  sessionId: string;
  userEmail: string | null;
  userPhone: string | null;
  updatedAt: string;
  cartValue: number;
  items: AbandonedCartItem[];
};

export type CartAbandonment = {
  thresholdHours: number;
  totalAbandonedCarts: number;
  totalAbandonedValue: number;
  carts: AbandonedCart[];
};
