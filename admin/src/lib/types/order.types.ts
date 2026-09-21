export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  imageUrl?: string | null;
  priceAtPurchase: number;
  quantity: number;
  subtotal: number;
};

export type Payment = {
  id: string;
  provider: string;
  providerPaymentId?: string | null;
  providerOrderId?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
};

export type OrderStatusHistoryEntry = {
  id: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  note?: string | null;
  createdAt: string;
  changedByAdmin?: { id: string; name: string; email: string } | null;
};

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  grandTotal: number;
  couponCode?: string | null;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  statusHistory?: OrderStatusHistoryEntry[];
};

export type OrderDetail = AdminOrderListItem & {
  shippingAddress: Record<string, unknown>;
  payments: Payment[];
  statusHistory: OrderStatusHistoryEntry[];
};

export type AdminOrderQuery = {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
};

export type UpdateOrderStatusInput = { status: OrderStatus; note?: string };
export type CancelOrderInput = { note?: string };

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'FAILED',
];

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED', 'FAILED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  FAILED: ['CANCELLED'],
};

export const PAYMENT_REQUIRED_STATUSES: OrderStatus[] = ['SHIPPED', 'DELIVERED'];
