import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { RevalidationService } from '../../revalidation/revalidation.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  CreateProductImageDto,
  UpdateProductImageDto,
} from './dto/product-image.dto';
import { AdminProductQueryDto } from './dto/admin-product-query.dto';
import { generateSlug } from '../../../common/utils/slug.util';
import { ProductStatus, StockStatus, Prisma } from '@prisma/client';

@Injectable()
export class AdminProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidation: RevalidationService,
  ) {}

  private buildOrderBy(
    sort?: string,
  ): Prisma.ProductOrderByWithRelationInput[] {
    switch (sort) {
      case 'newest':
        return [{ createdAt: 'desc' }];
      case 'oldest':
        return [{ createdAt: 'asc' }];
      case 'price_low_to_high':
        return [{ price: 'asc' }];
      case 'price_high_to_low':
        return [{ price: 'desc' }];
      default:
        return [{ priority: 'desc' }, { createdAt: 'desc' }];
    }
  }

  async findAll(query: AdminProductQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: this.buildOrderBy(query.sort),
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { where: { isPrimary: true }, take: 1 },
        },
      }),
    ]);

    return {
      items: items.map((p) => this.formatProduct(p)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        collectionProducts: {
          include: {
            collection: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
    if (!product)
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: 'PRODUCT_NOT_FOUND',
      });
    return this.formatProduct(product);
  }

  async create(dto: CreateProductDto) {
    const slug = dto.slug ?? generateSlug(dto.name);

    const [slugExists, skuExists] = await Promise.all([
      this.prisma.product.findUnique({ where: { slug } }),
      this.prisma.product.findUnique({ where: { sku: dto.sku } }),
    ]);

    if (slugExists)
      throw new ConflictException({
        message: `Slug "${slug}" already exists`,
        errorCode: 'SLUG_CONFLICT',
      });
    if (skuExists)
      throw new ConflictException({
        message: `SKU "${dto.sku}" already exists`,
        errorCode: 'SKU_CONFLICT',
      });

    const inventoryQuantity = dto.inventoryQuantity ?? 0;
    const lowStockThreshold = dto.lowStockThreshold ?? 5;
    const stockStatus = this.computeStockStatus(
      inventoryQuantity,
      lowStockThreshold,
    );

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        sku: dto.sku,
        shortDescription: dto.shortDescription,
        longDescription: dto.longDescription,
        storySummary: dto.storySummary,
        spiritualBenefitSummary: dto.spiritualBenefitSummary,
        usageGuide: dto.usageGuide,
        careInstructions: dto.careInstructions,
        price: dto.price,
        mrp: dto.mrp,
        discountPercent: dto.discountPercent ?? 0,
        categoryId: dto.categoryId,
        status: dto.status ?? ProductStatus.DRAFT,
        priority: dto.priority ?? 0,
        badge: dto.badge,
        inventoryQuantity,
        lowStockThreshold,
        stockStatus,
        attributes: dto.attributes as Prisma.InputJsonValue,
        publishedAt: dto.status === ProductStatus.PUBLISHED ? new Date() : null,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: true,
      },
    });

    void this.revalidation.revalidate(['products', `product:${product.slug}`]);
    return this.formatProduct(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const slug = dto.slug ?? (dto.name ? generateSlug(dto.name) : undefined);

    if (slug) {
      const existing = await this.prisma.product.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing)
        throw new ConflictException({
          message: `Slug "${slug}" already exists`,
          errorCode: 'SLUG_CONFLICT',
        });
    }
    if (dto.sku) {
      const existing = await this.prisma.product.findFirst({
        where: { sku: dto.sku, NOT: { id } },
      });
      if (existing)
        throw new ConflictException({
          message: `SKU "${dto.sku}" already exists`,
          errorCode: 'SKU_CONFLICT',
        });
    }

    const current = await this.prisma.product.findUniqueOrThrow({
      where: { id },
    });

    const inventoryQuantity =
      dto.inventoryQuantity ?? current.inventoryQuantity;
    const lowStockThreshold =
      dto.lowStockThreshold ?? current.lowStockThreshold;
    const stockStatus = this.computeStockStatus(
      inventoryQuantity,
      lowStockThreshold,
    );

    let publishedAt = current.publishedAt;
    if (dto.status === ProductStatus.PUBLISHED && !current.publishedAt) {
      publishedAt = new Date();
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        ...(slug ? { slug } : {}),
        stockStatus,
        publishedAt,
        attributes: dto.attributes as Prisma.InputJsonValue | undefined,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      },
    });

    const tags = new Set(['products', `product:${product.slug}`]);
    if (current.slug !== product.slug) tags.add(`product:${current.slug}`);
    void this.revalidation.revalidate([...tags]);

    return this.formatProduct(product);
  }

  async updateStatus(id: string, status: ProductStatus) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product)
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: 'PRODUCT_NOT_FOUND',
      });

    const publishedAt =
      status === ProductStatus.PUBLISHED && !product.publishedAt
        ? new Date()
        : product.publishedAt;

    const updated = await this.prisma.product.update({
      where: { id },
      data: { status, publishedAt },
      select: { id: true, status: true, publishedAt: true, slug: true },
    });
    void this.revalidation.revalidate(['products', `product:${updated.slug}`]);
    return updated;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.INACTIVE },
    });
    void this.revalidation.revalidate(['products', `product:${existing.slug}`]);
    return product;
  }

  // --- Product Images ---

  async getImages(productId: string) {
    await this.findOne(productId);
    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
    });
  }

  async addImage(productId: string, dto: CreateProductImageDto) {
    await this.findOne(productId);

    if (dto.isPrimary) {
      await this.prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    const imageCount = await this.prisma.productImage.count({
      where: { productId },
    });
    const isPrimary = dto.isPrimary ?? imageCount === 0;

    return this.prisma.productImage.create({
      data: {
        productId,
        imageUrl: dto.imageUrl,
        thumbnailUrl: dto.thumbnailUrl,
        cardUrl: dto.cardUrl,
        detailUrl: dto.detailUrl,
        storageKey: dto.storageKey,
        storageProvider: dto.storageProvider,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        altText: dto.altText,
        title: dto.title,
        width: dto.width,
        height: dto.height,
        sortOrder: dto.sortOrder ?? imageCount,
        isPrimary,
      },
    });
  }

  async updateImage(imageId: string, dto: UpdateProductImageDto) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });
    if (!image)
      throw new NotFoundException({
        message: 'Image not found',
        errorCode: 'IMAGE_NOT_FOUND',
      });

    return this.prisma.productImage.update({
      where: { id: imageId },
      data: dto,
    });
  }

  async removeImage(imageId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });
    if (!image)
      throw new NotFoundException({
        message: 'Image not found',
        errorCode: 'IMAGE_NOT_FOUND',
      });

    await this.prisma.productImage.delete({ where: { id: imageId } });

    if (image.isPrimary) {
      const next = await this.prisma.productImage.findFirst({
        where: { productId: image.productId },
        orderBy: { sortOrder: 'asc' },
      });
      if (next)
        await this.prisma.productImage.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
    }
  }

  async setPrimaryImage(imageId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });
    if (!image)
      throw new NotFoundException({
        message: 'Image not found',
        errorCode: 'IMAGE_NOT_FOUND',
      });

    await this.prisma.productImage.updateMany({
      where: { productId: image.productId },
      data: { isPrimary: false },
    });
    return this.prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });
  }

  private computeStockStatus(qty: number, threshold: number): StockStatus {
    if (qty <= 0) return StockStatus.OUT_OF_STOCK;
    if (qty <= threshold) return StockStatus.LOW_STOCK;
    return StockStatus.IN_STOCK;
  }

  private formatProduct(product: any) {
    return {
      ...product,
      price: Number(product.price),
      mrp: Number(product.mrp),
      discountPercent: Number(product.discountPercent),
    };
  }
}
