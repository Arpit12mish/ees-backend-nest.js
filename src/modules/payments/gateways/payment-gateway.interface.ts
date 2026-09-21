export interface InitiatePaymentInput {
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
}

export interface InitiatePaymentResult {
  providerPaymentId: string;
  providerOrderId: string;
  status: string;
  rawResponse: Record<string, unknown>;
}

export interface VerifyPaymentInput {
  providerPaymentId: string;
  providerOrderId?: string;
  rawSignature?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  providerPaymentId: string;
  rawResponse: Record<string, unknown>;
}

export interface PaymentGateway {
  readonly name: string;
  createPayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
  getPaymentStatus(orderNumber: string): Promise<Record<string, unknown>>;
}
