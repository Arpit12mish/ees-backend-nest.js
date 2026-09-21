import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  paginate,
  getPaginationParams,
} from '../../common/utils/pagination.util';

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  shortDescription: true,
  price: true,
  mrp: true,
  discountPercent: true,
  currency: true,
  stockStatus: true,
  attributes: true,
  priority: true,
  category: { select: { id: true, name: true, slug: true } },
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
};

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.collection.findMany({
      where: { isActive: true },
      orderBy: [{ priority: 'desc' }, { name: 'asc' }],
    });
  }

  async findBySlug(slug: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { slug, isActive: true },
    });
    if (!collection) {
      throw new NotFoundException({
        message: 'Collection not found',
        errorCode: 'COLLECTION_NOT_FOUND',
      });
    }
    return collection;
  }

  async findProductsBySlug(slug: string, page = 1, limit = 20) {
    const collection = await this.findBySlug(slug);
    const { skip, take } = getPaginationParams(page, limit);

    const [collectionProducts, total] = await Promise.all([
      this.prisma.collectionProduct.findMany({
        where: {
          collectionId: collection.id,
          product: { status: 'PUBLISHED', category: { isActive: true } },
        },
        include: { product: { select: PRODUCT_SELECT } },
        orderBy: [{ sortOrder: 'asc' }],
        skip,
        take,
      }),
      this.prisma.collectionProduct.count({
        where: {
          collectionId: collection.id,
          product: { status: 'PUBLISHED', category: { isActive: true } },
        },
      }),
    ]);

    const items = collectionProducts.map((cp) =>
      this.formatProductCard(cp.product),
    );

    return {
      collection,
      ...paginate(items, total, page, limit),
    };
  }

  private formatProductCard(product: {
    price: unknown;
    mrp: unknown;
    discountPercent: unknown;
    images: Array<{
      imageUrl: string;
      thumbnailUrl: string | null;
      cardUrl: string | null;
      detailUrl: string | null;
    }>;
  }) {
    const images = product.images.map((img) => ({
      ...img,
      thumbnailUrl: img.thumbnailUrl ?? img.imageUrl,
      cardUrl: img.cardUrl ?? img.imageUrl,
      detailUrl: img.detailUrl ?? img.imageUrl,
    }));

    return {
      ...product,
      images,
      primaryImage: images[0] ?? null,
      price: Number(product.price),
      mrp: Number(product.mrp),
      discountPercent: Number(product.discountPercent),
    };
  }
}
