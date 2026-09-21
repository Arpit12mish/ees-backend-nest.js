import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  paginate,
  getPaginationParams,
} from '../../common/utils/pagination.util';
import { ProductQueryDto } from './dto/product-query.dto';

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  shortDescription: true,
  longDescription: true,
  storySummary: true,
  spiritualBenefitSummary: true,
  usageGuide: true,
  careInstructions: true,
  price: true,
  mrp: true,
  discountPercent: true,
  currency: true,
  stockStatus: true,
  attributes: true,
  priority: true,
  badge: true,
  publishedAt: true,
  category: {
    select: { id: true, name: true, slug: true },
  },
  images: {
    orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
    select: {
      id: true,
      imageUrl: true,
      thumbnailUrl: true,
      cardUrl: true,
      detailUrl: true,
      altText: true,
      title: true,
      width: true,
      height: true,
      sortOrder: true,
      isPrimary: true,
    },
  },
} satisfies Prisma.ProductSelect;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildOrderBy(
    sort?: string,
  ): Prisma.ProductOrderByWithRelationInput[] {
    switch (sort) {
      case 'newest':
        return [{ publishedAt: 'desc' }, { createdAt: 'desc' }];
      case 'price_low_to_high':
        return [{ price: 'asc' }];
      case 'price_high_to_low':
        return [{ price: 'desc' }];
      default:
        return [{ priority: 'desc' }, { publishedAt: 'desc' }];
    }
  }

  async findAll(query: ProductQueryDto) {
    const { skip, take, page, limit } = getPaginationParams(
      query.page,
      query.limit,
    );

    const where: Prisma.ProductWhereInput = {
      status: 'PUBLISHED',
      category: { isActive: true },
    };

    if (query.category) {
      where.category = { slug: query.category, isActive: true };
    }
    if (query.collection) {
      where.collectionProducts = {
        some: { collection: { slug: query.collection, isActive: true } },
      };
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }
    if (query.search) {
      return this.search(query.search, query.page, query.limit);
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        select: PRODUCT_SELECT,
        orderBy: this.buildOrderBy(query.sort),
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(this.formatProducts(items), total, page, limit);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: 'PUBLISHED', category: { isActive: true } },
      select: PRODUCT_SELECT,
    });

    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: 'PRODUCT_NOT_FOUND',
      });
    }

    const seoMetadata = await this.prisma.seoMetadata.findFirst({
      where: { entityType: 'PRODUCT', entityId: product.id },
    });

    return {
      ...this.formatSingleProduct(product),
      seoMetadata: seoMetadata ?? null,
    };
  }

  async findByCategory(categorySlug: string, query: ProductQueryDto) {
    return this.findAll({ ...query, category: categorySlug });
  }

  async findFeatured() {
    const items = await this.prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        category: { isActive: true },
        collectionProducts: {
          some: { collection: { slug: 'best-sellers', isActive: true } },
        },
      },
      select: PRODUCT_SELECT,
      orderBy: [{ priority: 'desc' }],
      take: 12,
    });
    return this.formatProducts(items);
  }

  async search(q: string, page = 1, limit = 20) {
    const {
      skip,
      take,
      page: safePage,
      limit: safeLimit,
    } = getPaginationParams(page, limit);

    // word_similarity (not plain similarity) so a single misspelled word in a
    // multi-word product name still scores high: similarity() dilutes across
    // the whole field (e.g. "citryne" vs "Citrine Money Attraction Stone"
    // scores 0.16, below any sane threshold), while word_similarity() matches
    // the typo against its best-fitting substring (same pair scores 0.5).
    const ranked = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT p."id" FROM "Product" p
      JOIN "Category" c ON c."id" = p."categoryId"
      WHERE p."status" = 'PUBLISHED' AND c."isActive" = true
        AND (
          p."searchVector" @@ websearch_to_tsquery('english', ${q})
          OR word_similarity(${q}, p."name") > 0.3
          OR word_similarity(${q}, p."sku") > 0.3
        )
      ORDER BY ts_rank(p."searchVector", websearch_to_tsquery('english', ${q})) DESC,
               word_similarity(${q}, p."name") DESC
      LIMIT ${take} OFFSET ${skip};
    `;
    const countRows = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count FROM "Product" p
      JOIN "Category" c ON c."id" = p."categoryId"
      WHERE p."status" = 'PUBLISHED' AND c."isActive" = true
        AND (
          p."searchVector" @@ websearch_to_tsquery('english', ${q})
          OR word_similarity(${q}, p."name") > 0.3
          OR word_similarity(${q}, p."sku") > 0.3
        );
    `;

    const ids = ranked.map((r) => r.id);
    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
      select: PRODUCT_SELECT,
    });
    const byId = new Map(products.map((p) => [p.id, p]));
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    return paginate(
      this.formatProducts(ordered),
      Number(countRows[0]?.count ?? 0),
      safePage,
      safeLimit,
    );
  }

  private formatProducts(
    items: Prisma.ProductGetPayload<{ select: typeof PRODUCT_SELECT }>[],
  ) {
    return items.map((p) => this.formatSingleProduct(p));
  }

  private formatSingleProduct(
    p: Prisma.ProductGetPayload<{ select: typeof PRODUCT_SELECT }>,
  ) {
    const images = p.images.map((img) => ({
      ...img,
      thumbnailUrl: img.thumbnailUrl ?? img.imageUrl,
      cardUrl: img.cardUrl ?? img.imageUrl,
      detailUrl: img.detailUrl ?? img.imageUrl,
    }));
    const primaryImage =
      images.find((img) => img.isPrimary) ?? images[0] ?? null;
    return {
      ...p,
      images,
      price: Number(p.price),
      mrp: Number(p.mrp),
      discountPercent: Number(p.discountPercent),
      primaryImage,
    };
  }
}
