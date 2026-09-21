import { Injectable } from '@nestjs/common';
import {
  PaymentGateway,
  InitiatePaymentInput,
  InitiatePaymentResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from './payment-gateway.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class MockPaymentGateway implements PaymentGateway {
  readonly name = 'mock';

  async createPayment(
    input: InitiatePaymentInput,
  ): Promise<InitiatePaymentResult> {
    const providerPaymentId = `mock_pay_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const providerOrderId = `mock_ord_${randomUUID().replace(/-/g, '').slice(0, 16)}`;

    return {
      providerPaymentId,
      providerOrderId,
      status: 'PENDING',
      rawResponse: {
        initiated: true,
        orderNumber: input.orderNumber,
        providerPaymentId,
        providerOrderId,
      },
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    return {
      success: true,
      providerPaymentId: input.providerPaymentId,
      rawResponse: {
        verified: true,
        verifiedAt: new Date().toISOString(),
        providerPaymentId: input.providerPaymentId,
      },
    };
  }

  async getPaymentStatus(
    orderNumber: string,
  ): Promise<Record<string, unknown>> {
    return { provider: this.name, orderNumber };
  }
}
