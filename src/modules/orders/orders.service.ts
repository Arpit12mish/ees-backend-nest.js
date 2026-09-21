import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/order.dto';
import { CouponsService } from '../coupons/coupons.service';

const SHIPPING_THRESHOLD = 499;
const SHIPPING_AMOUNT = 49;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly couponsService: CouponsService,
  ) {}

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.order.count();
    const seq = String(count + 1).padStart(6, '0');
    return `ORD-${dateStr}-${seq}`;
  }

  async createOrder(dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { sessionId: dto.sessionId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException({
        message: 'Cart is empty or not found',
        errorCode: 'CART_EMPTY',
      });
    }

    for (const item of cart.items) {
      if (item.product.status !== 'PUBLISHED') {
        throw new BadRequestException({
          message: `Product "${item.product.name}" is no longer available`,
          errorCode: 'PRODUCT_UNAVAILABLE',
        });
      }
      if (item.product.stockStatus === 'OUT_OF_STOCK') {
        throw new BadRequestException({
          message: `Product "${item.product.name}" is out of stock`,
          errorCode: 'PRODUCT_OUT_OF_STOCK',
        });
      }
      if (item.product.inventoryQuantity < item.quantity) {
        throw new BadRequestException({
          message: `Only ${item.product.inventoryQuantity} units of "${item.product.name}" available`,
          errorCode: 'INSUFFICIENT_STOCK',
        });
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.priceAtAdd) * item.quantity,
      0,
    );

    let discountAmount = 0;
    let isFreeShipping = false;
    const couponCode = cart.couponCode ?? null;

    if (couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: couponCode },
      });
      this.couponsService.validateCouponForAmount(coupon, subtotal);
      const result = this.couponsService.computeDiscount(coupon, subtotal);
      discountAmount = result.discountAmount;
      isFreeShipping = result.isFreeShipping;
    }

    const shippingAmount =
      isFreeShipping || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_AMOUNT;
    const grandTotal = Math.max(0, subtotal - discountAmount + shippingAmount);
    const orderNumber = await this.generateOrderNumber();

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          shippingAddress:
            dto.shippingAddress as unknown as Prisma.InputJsonValue,
          subtotal,
          couponCode,
          discountAmount,
          shippingAmount,
          grandTotal,
          paymentStatus: 'PENDING',
          orderStatus: 'PENDING_PAYMENT',
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              sku: item.product.sku,
              imageUrl:
                item.product.images[0]?.detailUrl ??
                item.product.images[0]?.cardUrl ??
                item.product.images[0]?.imageUrl ??
                null,
              priceAtPurchase: item.priceAtAdd,
              quantity: item.quantity,
              subtotal: Number(item.priceAtAdd) * item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      if (couponCode) {
        await tx.coupon.update({
          where: { code: couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.cart.update({
        where: { id: cart.id },
        data: {
          userEmail: dto.customerEmail,
          userPhone: dto.customerPhone,
        },
      });

      return createdOrder;
    });

    return {
      ...order,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      shippingAmount: Number(order.shippingAmount),
      grandTotal: Number(order.grandTotal),
      items: order.items.map((i) => ({
        ...i,
        priceAtPurchase: Number(i.priceAtPurchase),
        subtotal: Number(i.subtotal),
      })),
    };
  }

  async getOrder(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order)
      throw new NotFoundException({
        message: 'Order not found',
        errorCode: 'ORDER_NOT_FOUND',
      });

    return {
      ...order,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      shippingAmount: Number(order.shippingAmount),
      grandTotal: Number(order.grandTotal),
      items: order.items.map((i) => ({
        ...i,
        priceAtPurchase: Number(i.priceAtPurchase),
        subtotal: Number(i.subtotal),
      })),
    };
  }
}
