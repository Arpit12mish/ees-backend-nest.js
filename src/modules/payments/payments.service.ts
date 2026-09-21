import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto, VerifyPaymentDto } from './dto/payment.dto';
import { MockPaymentGateway } from './gateways/mock-payment.gateway';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: MockPaymentGateway,
  ) {}

  async createPayment(dto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber: dto.orderNumber },
    });
    if (!order)
      throw new NotFoundException({
        message: 'Order not found',
        errorCode: 'ORDER_NOT_FOUND',
      });

    if (order.paymentStatus === 'SUCCESS') {
      return {
        orderNumber: order.orderNumber,
        amount: Number(order.grandTotal),
        currency: 'INR',
        status: 'SUCCESS',
        message: 'Order is already paid.',
      };
    }

    const result = await this.gateway.createPayment({
      orderNumber: order.orderNumber,
      amount: Number(order.grandTotal),
      currency: 'INR',
      customerEmail: order.customerEmail,
    });

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        provider: this.gateway.name,
        providerPaymentId: result.providerPaymentId,
        providerOrderId: result.providerOrderId,
        amount: order.grandTotal,
        currency: 'INR',
        status: 'PENDING',
        rawResponse: result.rawResponse as Prisma.InputJsonValue,
      },
    });

    return {
      orderNumber: order.orderNumber,
      amount: Number(order.grandTotal),
      currency: 'INR',
      providerPaymentId: result.providerPaymentId,
      providerOrderId: result.providerOrderId,
      status: 'PENDING',
      message: `Payment initiated via ${this.gateway.name}. Use /api/payments/verify to complete.`,
    };
  }

  async verifyPayment(dto: VerifyPaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber: dto.orderNumber },
      include: { items: { include: { product: true } } },
    });

    if (!order)
      throw new NotFoundException({
        message: 'Order not found',
        errorCode: 'ORDER_NOT_FOUND',
      });

    // Idempotent: if already paid, return success without re-processing
    if (order.paymentStatus === 'SUCCESS') {
      return {
        orderNumber: order.orderNumber,
        paymentStatus: 'SUCCESS',
        orderStatus: order.orderStatus,
        amount: Number(order.grandTotal),
        message: 'Order already confirmed.',
      };
    }

    const payment = await this.prisma.payment.findFirst({
      where: { orderId: order.id, providerPaymentId: dto.mockPaymentId },
    });

    if (!payment)
      throw new NotFoundException({
        message: 'Payment record not found',
        errorCode: 'PAYMENT_NOT_FOUND',
      });

    const verifyResult = await this.gateway.verifyPayment({
      providerPaymentId: dto.mockPaymentId,
    });
    if (!verifyResult.success) {
      throw new BadRequestException({
        message: 'Payment verification failed',
        errorCode: 'PAYMENT_VERIFICATION_FAILED',
      });
    }

    await this.prisma.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: true } } },
      });
      if (!currentOrder)
        throw new NotFoundException({
          message: 'Order not found',
          errorCode: 'ORDER_NOT_FOUND',
        });
      if (currentOrder.paymentStatus === 'SUCCESS') return;

      const claimed = await tx.order.updateMany({
        where: { id: currentOrder.id, paymentStatus: { not: 'SUCCESS' } },
        data: { paymentStatus: 'SUCCESS', orderStatus: 'CONFIRMED' },
      });
      if (claimed.count === 0) return;

      await tx.orderStatusHistory.create({
        data: {
          orderId: currentOrder.id,
          oldStatus: currentOrder.orderStatus,
          newStatus: 'CONFIRMED',
          note: 'Payment verified',
        },
      });

      for (const item of currentOrder.items) {
        if (item.product.inventoryQuantity < item.quantity) {
          throw new BadRequestException({
            message: `Insufficient stock for "${item.product.name}"`,
            errorCode: 'INSUFFICIENT_STOCK',
          });
        }
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            inventoryQuantity: { gte: item.quantity },
          },
          data: { inventoryQuantity: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new BadRequestException({
            message: `Insufficient stock for "${item.product.name}"`,
            errorCode: 'INSUFFICIENT_STOCK',
          });
        }
        const updatedProduct = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
          select: { inventoryQuantity: true, lowStockThreshold: true },
        });
        const stockStatus =
          updatedProduct.inventoryQuantity <= 0
            ? 'OUT_OF_STOCK'
            : updatedProduct.inventoryQuantity <=
                updatedProduct.lowStockThreshold
              ? 'LOW_STOCK'
              : 'IN_STOCK';
        await tx.product.update({
          where: { id: item.productId },
          data: { stockStatus },
        });
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          rawResponse: verifyResult.rawResponse as Prisma.InputJsonValue,
        },
      });

      const cart = await tx.cart.findFirst({
        where: { userEmail: currentOrder.customerEmail },
      });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        await tx.cart.update({
          where: { id: cart.id },
          data: { couponCode: null },
        });
      }
    });

    return {
      orderNumber: order.orderNumber,
      paymentStatus: 'SUCCESS',
      orderStatus: 'CONFIRMED',
      amount: Number(order.grandTotal),
      message: 'Payment verified. Order confirmed.',
    };
  }

  async getPaymentStatus(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!order)
      throw new NotFoundException({
        message: 'Order not found',
        errorCode: 'ORDER_NOT_FOUND',
      });

    const latestPayment = order.payments[0] ?? null;

    return {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      grandTotal: Number(order.grandTotal),
      currency: 'INR',
      latestPayment: latestPayment
        ? {
            id: latestPayment.id,
            provider: latestPayment.provider,
            providerPaymentId: latestPayment.providerPaymentId,
            amount: Number(latestPayment.amount),
            status: latestPayment.status,
            createdAt: latestPayment.createdAt,
          }
        : null,
    };
  }
}
