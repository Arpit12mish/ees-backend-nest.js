import { Injectable } from '@nestjs/common';
import { AnalyticsEventType, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(days = 30) {
    const from = this.daysAgo(days);

    const [eventGroups, uniqueVisitorGroups, orderAgg] = await Promise.all([
      this.prisma.analyticsEvent.groupBy({
        by: ['type'],
        where: { createdAt: { gte: from } },
        _count: { _all: true },
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ['visitorId'],
        where: { createdAt: { gte: from } },
      }),
      this.prisma.order.aggregate({
        where: {
          paymentStatus: PaymentStatus.SUCCESS,
          createdAt: { gte: from },
        },
        _count: { _all: true },
        _sum: { grandTotal: true },
      }),
    ]);

    const eventCounts = Object.fromEntries(
      Object.values(AnalyticsEventType).map((type) => [type, 0]),
    ) as Record<AnalyticsEventType, number>;
    for (const group of eventGroups) {
      eventCounts[group.type] = group._count._all;
    }

    const uniqueVisitors = uniqueVisitorGroups.length;
    const ordersCompletedEvents = eventCounts.ORDER_COMPLETED;
    const conversionRate =
      uniqueVisitors > 0
        ? Number(((ordersCompletedEvents / uniqueVisitors) * 100).toFixed(2))
        : 0;

    return {
      days,
      uniqueVisitors,
      eventCounts,
      conversionRate,
      orders: {
        count: orderAgg._count._all,
        revenue: Number(orderAgg._sum.grandTotal ?? 0),
      },
    };
  }

  async getProducts(days = 30, limit = 20) {
    const from = this.daysAgo(days);

    const [viewGroups, cartGroups, purchaseGroups] = await Promise.all([
      this.prisma.analyticsEvent.groupBy({
        by: ['productId'],
        where: {
          type: AnalyticsEventType.PRODUCT_VIEW,
          createdAt: { gte: from },
          productId: { not: null },
        },
        _count: { _all: true },
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ['productId'],
        where: {
          type: AnalyticsEventType.ADD_TO_CART,
          createdAt: { gte: from },
          productId: { not: null },
        },
        _count: { _all: true },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            paymentStatus: PaymentStatus.SUCCESS,
            createdAt: { gte: from },
          },
        },
        _sum: { quantity: true },
      }),
    ]);

    const views = new Map(
      viewGroups.map((g) => [g.productId as string, g._count._all]),
    );
    const addToCart = new Map(
      cartGroups.map((g) => [g.productId as string, g._count._all]),
    );
    const purchases = new Map(
      purchaseGroups.map((g) => [g.productId, g._sum.quantity ?? 0]),
    );

    const productIds = new Set([
      ...views.keys(),
      ...addToCart.keys(),
      ...purchases.keys(),
    ]);
    const products = await this.prisma.product.findMany({
      where: { id: { in: Array.from(productIds) } },
      select: { id: true, name: true, slug: true, sku: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    const rows = Array.from(productIds)
      .map((productId) => ({
        product: byId.get(productId) ?? null,
        productId,
        views: views.get(productId) ?? 0,
        addToCart: addToCart.get(productId) ?? 0,
        purchased: purchases.get(productId) ?? 0,
      }))
      .filter((row) => row.product !== null)
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);

    return { days, limit, products: rows };
  }

  async getSearches(days = 30, limit = 20) {
    const from = this.daysAgo(days);

    const [topSearches, zeroResultSearches] = await Promise.all([
      this.prisma.analyticsEvent.groupBy({
        by: ['searchQuery'],
        where: {
          type: AnalyticsEventType.SEARCH,
          createdAt: { gte: from },
          searchQuery: { not: null },
        },
        _count: { _all: true },
        orderBy: { _count: { searchQuery: 'desc' } },
        take: limit,
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ['searchQuery'],
        where: {
          type: AnalyticsEventType.SEARCH,
          createdAt: { gte: from },
          searchQuery: { not: null },
          resultCount: 0,
        },
        _count: { _all: true },
        orderBy: { _count: { searchQuery: 'desc' } },
        take: limit,
      }),
    ]);

    return {
      days,
      limit,
      topSearches: topSearches.map((row) => ({
        query: row.searchQuery,
        count: row._count._all,
      })),
      zeroResultSearches: zeroResultSearches.map((row) => ({
        query: row.searchQuery,
        count: row._count._all,
      })),
    };
  }

  async getCartAbandonment(hours = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

    const perCart = await this.prisma.cartItem.groupBy({
      by: ['cartId'],
      _max: { updatedAt: true },
    });
    const staleCartIds = perCart
      .filter((g) => g._max.updatedAt && g._max.updatedAt < cutoff)
      .map((g) => g.cartId);

    const carts = await this.prisma.cart.findMany({
      where: { id: { in: staleCartIds } },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, price: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    let totalAbandonedValue = 0;
    const formattedCarts = carts.map((cart) => {
      const items = cart.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        priceAtAdd: Number(item.priceAtAdd),
        itemSubtotal: Number(item.priceAtAdd) * item.quantity,
        product: item.product
          ? { ...item.product, price: Number(item.product.price) }
          : null,
      }));
      const cartValue = items.reduce((sum, item) => sum + item.itemSubtotal, 0);
      totalAbandonedValue += cartValue;
      return {
        id: cart.id,
        sessionId: cart.sessionId,
        userEmail: cart.userEmail,
        userPhone: cart.userPhone,
        updatedAt: cart.updatedAt,
        cartValue,
        items,
      };
    });

    return {
      thresholdHours: hours,
      totalAbandonedCarts: formattedCarts.length,
      totalAbandonedValue,
      carts: formattedCarts,
    };
  }

  private daysAgo(days: number): Date {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  }
}
