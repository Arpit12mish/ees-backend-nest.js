import type { ProductCardProduct } from './product.types';

export type CartItem = {
  id: string;
  quantity: number;
  priceAtAdd: number;
  itemSubtotal: number;
  product: ProductCardProduct;
};

export type Cart = {
  id: string;
  sessionId: string;
  couponCode?: string | null;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  grandTotal: number;
  itemCount: number;
};

export type AddToCartInput = {
  sessionId: string;
  productId: string;
  quantity: number;
  userEmail?: string;
  userPhone?: string;
};

export type CouponValidation = {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: number;
  discountAmount: number;
  isFreeShipping: boolean;
};
