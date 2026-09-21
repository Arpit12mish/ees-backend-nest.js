import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, VerifyPaymentDto } from './dto/payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  async createPayment(@Body() dto: CreatePaymentDto) {
    const data = await this.paymentsService.createPayment(dto);
    return { success: true, message: 'Payment initiated', data };
  }

  @Post('verify')
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    const data = await this.paymentsService.verifyPayment(dto);
    return { success: true, message: 'Payment verified successfully', data };
  }

  @Get('status/:orderNumber')
  async getStatus(@Param('orderNumber') orderNumber: string) {
    const data = await this.paymentsService.getPaymentStatus(orderNumber);
    return { success: true, message: 'Payment status fetched', data };
  }
}
