import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import {
  getPaginationParams,
  paginate,
} from '../../common/utils/pagination.util';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(slug: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: 'PRODUCT_NOT_FOUND',
      });
    }

    const verifiedOrder = await this.prisma.order.findFirst({
      where: {
        customerEmail: dto.customerEmail,
        orderStatus: 'DELIVERED',
        items: { some: { productId: product.id } },
      },
      select: { id: true },
    });

    return this.prisma.review.create({
      data: {
        productId: product.id,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
        isVerifiedPurchase: Boolean(verifiedOrder),
        isApproved: false,
      },
    });
  }

  async findApproved(slug: string, page: number, limit: number) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: 'PRODUCT_NOT_FOUND',
      });
    }

    const {
      skip,
      take,
      page: safePage,
      limit: safeLimit,
    } = getPaginationParams(page, limit);
    const where = { productId: product.id, isApproved: true };

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          customerName: true,
          rating: true,
          title: true,
          comment: true,
          isVerifiedPurchase: true,
          createdAt: true,
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return paginate(items, total, safePage, safeLimit);
  }
}
