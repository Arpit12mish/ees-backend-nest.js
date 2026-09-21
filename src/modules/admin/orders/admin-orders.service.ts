import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import {
  UpdateOrderStatusDto,
  CancelOrderDto,
} from './dto/update-order-status.dto';
import { OrderStatus, AdminRole, Prisma } from '@prisma/client';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING_PAYMENT]: [
    OrderStatus.CONFIRMED,
    OrderStatus.CANCELLED,
    OrderStatus.FAILED,
  ],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.FAILED]: [OrderStatus.CANCELLED],
};

const REQUIRES_PAYMENT: OrderStatus[] = [
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AdminOrderQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (query.orderStatus) where.orderStatus = query.orderStatus;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
    }
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { customerEmail: { contains: query.search, mode: 'insensitive' } },
        { customerName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
    ]);

    return {
      items: items.map(this.formatOrder),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: { orderBy: { createdAt: 'desc' } },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: {
            changedByAdmin: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
    if (!order)
      throw new NotFoundException({
        message: 'Order not found',
        errorCode: 'ORDER_NOT_FOUND',
      });
    return this.formatOrder(order);
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        payments: { orderBy: { createdAt: 'desc' } },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: {
            changedByAdmin: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
    if (!order)
      throw new NotFoundException({
        message: 'Order not found',
        errorCode: 'ORDER_NOT_FOUND',
      });
    return this.formatOrder(order);
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    adminId: string,
    adminRole: string,
  ) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order)
      throw new NotFoundException({
        message: 'Order not found',
        errorCode: 'ORDER_NOT_FOUND',
      });

    if (order.orderStatus === OrderStatus.CANCELLED) {
      if (adminRole !== AdminRole.SUPER_ADMIN) {
        throw new ForbiddenException({
          message: 'Only SUPER_ADMIN can modify cancelled orders',
          errorCode: 'FORBIDDEN',
        });
      }
    }

    const isSuperAdminRevivingCancelled =
      order.orderStatus === OrderStatus.CANCELLED &&
      adminRole === AdminRole.SUPER_ADMIN;
    const allowed = ALLOWED_TRANSITIONS[order.orderStatus] ?? [];
    if (!isSuperAdminRevivingCancelled && !allowed.includes(dto.status)) {
      throw new BadRequestException({
        message: `Cannot transition from ${order.orderStatus} to ${dto.status}`,
        errorCode: 'INVALID_STATUS_TRANSITION',
      });
    }

    if (
      REQUIRES_PAYMENT.includes(dto.status) &&
      order.paymentStatus !== 'SUCCESS'
    ) {
      throw new BadRequestException({
        message: `Order must be paid before marking as ${dto.status}`,
        errorCode: 'ORDER_NOT_PAID',
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { orderStatus: dto.status },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          oldStatus: order.orderStatus,
          newStatus: dto.status,
          note: dto.note,
          changedByAdminId: adminId,
        },
      });
    });

    return this.findOne(id);
  }

  async cancelOrder(
    id: string,
    dto: CancelOrderDto,
    adminId: string,
    adminRole: string,
  ) {
    return this.updateStatus(
      id,
      { status: OrderStatus.CANCELLED, note: dto.note ?? 'Cancelled by admin' },
      adminId,
      adminRole,
    );
  }

  private formatOrder(order: any) {
    return {
      ...order,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      shippingAmount: Number(order.shippingAmount),
      grandTotal: Number(order.grandTotal),
      items: order.items?.map((i: any) => ({
        ...i,
        priceAtPurchase: Number(i.priceAtPurchase),
        subtotal: Number(i.subtotal),
      })),
      payments: order.payments?.map((p: any) => ({
        ...p,
        amount: Number(p.amount),
      })),
    };
  }
}
