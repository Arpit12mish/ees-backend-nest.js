import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { Coupon, CouponType } from '@prisma/client';

export interface CouponValidationResult {
  coupon: Coupon;
  discountAmount: number;
  isFreeShipping: boolean;
}

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(dto: ValidateCouponDto): Promise<CouponValidationResult> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
    });
    const orderAmount =
      dto.orderAmount ?? (await this.getCartSubtotal(dto.sessionId));

    this.validateCouponForAmount(coupon, orderAmount);
    const { discountAmount, isFreeShipping } = this.computeDiscount(
      coupon,
      orderAmount,
    );

    await this.prisma.cart.updateMany({
      where: { sessionId: dto.sessionId },
      data: { couponCode: coupon.code },
    });

    return { coupon: coupon, discountAmount, isFreeShipping };
  }

  validateCouponForAmount(
    coupon: Coupon | null,
    orderAmount: number,
  ): asserts coupon is Coupon {
    if (!coupon || !coupon.isActive) {
      throw new NotFoundException({
        message: 'Coupon not found or inactive',
        errorCode: 'COUPON_NOT_FOUND',
      });
    }

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      throw new BadRequestException({
        message: 'Coupon is not yet active',
        errorCode: 'COUPON_NOT_ACTIVE',
      });
    }
    if (coupon.endDate && coupon.endDate < now) {
      throw new BadRequestException({
        message: 'Coupon has expired',
        errorCode: 'COUPON_EXPIRED',
      });
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException({
        message: 'Coupon usage limit reached',
        errorCode: 'COUPON_LIMIT_REACHED',
      });
    }
    if (
      coupon.minOrderAmount !== null &&
      orderAmount < Number(coupon.minOrderAmount)
    ) {
      throw new BadRequestException({
        message: `Minimum order amount of ₹${Number(coupon.minOrderAmount)} required`,
        errorCode: 'COUPON_MIN_AMOUNT',
      });
    }
  }

  computeDiscount(
    coupon: Coupon,
    orderAmount: number,
  ): { discountAmount: number; isFreeShipping: boolean } {
    if (coupon.type === CouponType.FREE_SHIPPING) {
      return { discountAmount: 0, isFreeShipping: true };
    }

    let discount = 0;
    if (coupon.type === CouponType.PERCENTAGE) {
      discount = (orderAmount * Number(coupon.value)) / 100;
      if (coupon.maxDiscountAmount !== null) {
        discount = Math.min(discount, Number(coupon.maxDiscountAmount));
      }
    } else if (coupon.type === CouponType.FIXED_AMOUNT) {
      discount = Math.min(Number(coupon.value), orderAmount);
    }

    return {
      discountAmount: parseFloat(discount.toFixed(2)),
      isFreeShipping: false,
    };
  }

  async removeCoupon(sessionId: string) {
    await this.prisma.cart.updateMany({
      where: { sessionId },
      data: { couponCode: null },
    });
    return { message: 'Coupon removed' };
  }

  private async getCartSubtotal(sessionId: string): Promise<number> {
    const cart = await this.prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });
    if (!cart)
      throw new NotFoundException({
        message: 'Cart not found',
        errorCode: 'CART_NOT_FOUND',
      });
    return cart.items.reduce(
      (sum, item) => sum + Number(item.priceAtAdd) * item.quantity,
      0,
    );
  }
}
