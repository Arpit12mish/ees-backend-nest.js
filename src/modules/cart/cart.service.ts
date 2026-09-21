import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { CouponsService } from '../coupons/coupons.service';

const SHIPPING_THRESHOLD = 499;
const SHIPPING_AMOUNT = 49;

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly couponsService: CouponsService,
  ) {}

  private async getOrCreateCart(
    sessionId: string,
    userEmail?: string,
    userPhone?: string,
  ) {
    let cart = await this.prisma.cart.findUnique({ where: { sessionId } });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { sessionId, userEmail, userPhone },
      });
    }
    return cart;
  }

  async addItem(dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      select: {
        id: true,
        name: true,
        price: true,
        status: true,
        stockStatus: true,
        inventoryQuantity: true,
      },
    });

    if (!product || product.status !== 'PUBLISHED') {
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: 'PRODUCT_NOT_FOUND',
      });
    }
    if (product.stockStatus === 'OUT_OF_STOCK') {
      throw new BadRequestException({
        message: 'Product is out of stock',
        errorCode: 'PRODUCT_OUT_OF_STOCK',
      });
    }
    if (product.inventoryQuantity < dto.quantity) {
      throw new BadRequestException({
        message: `Only ${product.inventoryQuantity} units available`,
        errorCode: 'INSUFFICIENT_STOCK',
      });
    }

    const cart = await this.getOrCreateCart(
      dto.sessionId,
      dto.userEmail,
      dto.userPhone,
    );

    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: dto.productId },
    });

    if (existing) {
      const newQty = existing.quantity + dto.quantity;
      if (product.inventoryQuantity < newQty) {
        throw new BadRequestException({
          message: `Only ${product.inventoryQuantity} units available`,
          errorCode: 'INSUFFICIENT_STOCK',
        });
      }
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty, priceAtAdd: product.price },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
          priceAtAdd: product.price,
        },
      });
    }

    return this.getCart(dto.sessionId);
  }

  async getCart(sessionId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                price: true,
                stockStatus: true,
                inventoryQuantity: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                  select: {
                    imageUrl: true,
                    thumbnailUrl: true,
                    cardUrl: true,
                    detailUrl: true,
                    altText: true,
                    title: true,
                    width: true,
                    height: true,
                    isPrimary: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException({
        message: 'Cart not found',
        errorCode: 'CART_NOT_FOUND',
      });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.priceAtAdd) * item.quantity,
      0,
    );

    let discountAmount = 0;
    let isFreeShipping = false;
    let appliedCouponCode: string | null = cart.couponCode ?? null;

    if (cart.couponCode) {
      try {
        const coupon = await this.prisma.coupon.findUnique({
          where: { code: cart.couponCode },
        });
        if (coupon) {
          this.couponsService.validateCouponForAmount(coupon, subtotal);
          const result = this.couponsService.computeDiscount(coupon, subtotal);
          discountAmount = result.discountAmount;
          isFreeShipping = result.isFreeShipping;
        } else {
          appliedCouponCode = null;
        }
      } catch {
        appliedCouponCode = null;
      }
    }

    const shippingAmount =
      isFreeShipping || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_AMOUNT;
    const grandTotal = Math.max(0, subtotal - discountAmount + shippingAmount);

    return {
      id: cart.id,
      sessionId: cart.sessionId,
      couponCode: appliedCouponCode,
      items: cart.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        priceAtAdd: Number(item.priceAtAdd),
        itemSubtotal: Number(item.priceAtAdd) * item.quantity,
        product: {
          ...item.product,
          price: Number(item.product.price),
          primaryImage: this.formatProductImage(item.product.images[0]),
        },
      })),
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      shippingAmount,
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      itemCount: cart.items.reduce((s, i) => s + i.quantity, 0),
    };
  }

  private formatProductImage(
    image:
      | {
          imageUrl: string;
          thumbnailUrl: string | null;
          cardUrl: string | null;
          detailUrl: string | null;
        }
      | null
      | undefined,
  ) {
    if (!image) return null;
    return {
      ...image,
      thumbnailUrl: image.thumbnailUrl ?? image.imageUrl,
      cardUrl: image.cardUrl ?? image.imageUrl,
      detailUrl: image.detailUrl ?? image.imageUrl,
    };
  }

  async updateItem(itemId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        product: { select: { inventoryQuantity: true, stockStatus: true } },
      },
    });

    if (!item)
      throw new NotFoundException({
        message: 'Cart item not found',
        errorCode: 'CART_ITEM_NOT_FOUND',
      });
    if (item.product.stockStatus === 'OUT_OF_STOCK') {
      throw new BadRequestException({
        message: 'Product is out of stock',
        errorCode: 'PRODUCT_OUT_OF_STOCK',
      });
    }
    if (item.product.inventoryQuantity < dto.quantity) {
      throw new BadRequestException({
        message: `Only ${item.product.inventoryQuantity} units available`,
        errorCode: 'INSUFFICIENT_STOCK',
      });
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });
    const cart = await this.prisma.cart.findUnique({
      where: { id: item.cartId },
    });
    return this.getCart(cart!.sessionId);
  }

  async removeItem(itemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!item)
      throw new NotFoundException({
        message: 'Cart item not found',
        errorCode: 'CART_ITEM_NOT_FOUND',
      });

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    const cart = await this.prisma.cart.findUnique({
      where: { id: item.cartId },
    });
    return this.getCart(cart!.sessionId);
  }

  async clearCart(sessionId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { sessionId } });
    if (!cart)
      throw new NotFoundException({
        message: 'Cart not found',
        errorCode: 'CART_NOT_FOUND',
      });

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { message: 'Cart cleared successfully' };
  }
}
