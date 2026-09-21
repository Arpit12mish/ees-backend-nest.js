import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MockPaymentGateway } from './gateways/mock-payment.gateway';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, MockPaymentGateway],
})
export class PaymentsModule {}
