import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import {
  AddCollectionProductDto,
  BulkAddCollectionProductsDto,
  ReorderCollectionProductDto,
} from './dto/collection-product.dto';
import { generateSlug } from '../../../common/utils/slug.util';

@Injectable()
export class AdminCollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.collection.findMany({
      orderBy: [{ priority: 'desc' }, { name: 'asc' }],
      include: { _count: { select: { collectionProducts: true } } },
    });
  }

  async findOne(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        collectionProducts: {
          orderBy: { sortOrder: 'asc' },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                status: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
    });
    if (!collection)
      throw new NotFoundException({
        message: 'Collection not found',
        errorCode: 'COLLECTION_NOT_FOUND',
      });
    return collection;
  }

  async create(dto: CreateCollectionDto) {
    const slug = dto.slug ?? generateSlug(dto.name);
    const existing = await this.prisma.collection.findUnique({
      where: { slug },
    });
    if (existing)
      throw new ConflictException({
        message: `Slug "${slug}" already exists`,
        errorCode: 'SLUG_CONFLICT',
      });

    return this.prisma.collection.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        priority: dto.priority ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateCollectionDto) {
    await this.findOne(id);
    const slug = dto.slug ?? (dto.name ? generateSlug(dto.name) : undefined);

    if (slug) {
      const existing = await this.prisma.collection.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing)
        throw new ConflictException({
          message: `Slug "${slug}" already exists`,
          errorCode: 'SLUG_CONFLICT',
        });
    }

    return this.prisma.collection.update({
      where: { id },
      data: { ...dto, ...(slug ? { slug } : {}) },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.collection.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // --- Collection Products ---

  async addProduct(collectionId: string, dto: AddCollectionProductDto) {
    await this.findOne(collectionId);

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product)
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: 'PRODUCT_NOT_FOUND',
      });

    const existing = await this.prisma.collectionProduct.findUnique({
      where: {
        collectionId_productId: { collectionId, productId: dto.productId },
      },
    });
    if (existing)
      throw new ConflictException({
        message: 'Product already in collection',
        errorCode: 'PRODUCT_IN_COLLECTION',
      });

    const count = await this.prisma.collectionProduct.count({
      where: { collectionId },
    });

    return this.prisma.collectionProduct.create({
      data: {
        collectionId,
        productId: dto.productId,
        sortOrder: dto.sortOrder ?? count,
      },
    });
  }

  async bulkAddProducts(
    collectionId: string,
    dto: BulkAddCollectionProductsDto,
  ) {
    await this.findOne(collectionId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.productIds } },
      select: { id: true },
    });
    if (products.length !== dto.productIds.length) {
      throw new NotFoundException({
        message: 'One or more products not found',
        errorCode: 'PRODUCT_NOT_FOUND',
      });
    }

    const existingLinks = await this.prisma.collectionProduct.findMany({
      where: { collectionId, productId: { in: dto.productIds } },
      select: { productId: true },
    });
    const existingIds = new Set(existingLinks.map((l) => l.productId));
    const newIds = dto.productIds.filter((id) => !existingIds.has(id));

    const currentCount = await this.prisma.collectionProduct.count({
      where: { collectionId },
    });

    await this.prisma.collectionProduct.createMany({
      data: newIds.map((productId, i) => ({
        collectionId,
        productId,
        sortOrder: currentCount + i,
      })),
    });

    return { added: newIds.length, skipped: existingIds.size };
  }

  async removeProduct(collectionId: string, productId: string) {
    const link = await this.prisma.collectionProduct.findUnique({
      where: { collectionId_productId: { collectionId, productId } },
    });
    if (!link)
      throw new NotFoundException({
        message: 'Product not in collection',
        errorCode: 'PRODUCT_NOT_IN_COLLECTION',
      });

    await this.prisma.collectionProduct.delete({
      where: { collectionId_productId: { collectionId, productId } },
    });
  }

  async updateProductSortOrder(
    collectionId: string,
    productId: string,
    dto: ReorderCollectionProductDto,
  ) {
    const link = await this.prisma.collectionProduct.findUnique({
      where: { collectionId_productId: { collectionId, productId } },
    });
    if (!link)
      throw new NotFoundException({
        message: 'Product not in collection',
        errorCode: 'PRODUCT_NOT_IN_COLLECTION',
      });

    return this.prisma.collectionProduct.update({
      where: { collectionId_productId: { collectionId, productId } },
      data: { sortOrder: dto.sortOrder },
    });
  }
}
