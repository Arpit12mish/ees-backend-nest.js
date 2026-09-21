export type ShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

export type CreateOrderInput = {
  sessionId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
};

export type Order = {
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
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  orderStatus:
    | 'PENDING_PAYMENT'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'FAILED';
};

export type PaymentCreateResponse = {
  orderNumber: string;
  amount: number;
  currency: string;
  providerPaymentId?: string;
  providerOrderId?: string;
  status: string;
  message: string;
};

export type PaymentVerifyResponse = {
  orderNumber: string;
  paymentStatus: string;
  orderStatus: string;
  amount: number;
  message: string;
};
