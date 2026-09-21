import { Controller, Post, Delete, Param, Body } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly service: CouponsService) {}

  @Post('validate')
  async validate(@Body() dto: ValidateCouponDto) {
    const result = await this.service.validate(dto);
    return {
      success: true,
      message: 'Coupon applied',
      data: {
        code: result.coupon.code,
        type: result.coupon.type,
        value: Number(result.coupon.value),
        discountAmount: result.discountAmount,
        isFreeShipping: result.isFreeShipping,
      },
    };
  }

  @Delete(':sessionId')
  async remove(@Param('sessionId') sessionId: string) {
    const data = await this.service.removeCoupon(sessionId);
    return { success: true, message: data.message, data: null };
  }
}
