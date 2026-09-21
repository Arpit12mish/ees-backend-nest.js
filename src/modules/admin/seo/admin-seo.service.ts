import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import { UpsertSeoDto } from './dto/upsert-seo.dto';
import { UpdateSeoDto } from './dto/update-seo.dto';
import { SeoEntityType } from '@prisma/client';

@Injectable()
export class AdminSeoService {
  private readonly frontendBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.frontendBaseUrl = config.get<string>(
      'frontendBaseUrl',
      'http://localhost:3000',
    );
  }

  async findAll() {
    return this.prisma.seoMetadata.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async findOne(id: string) {
    const seo = await this.prisma.seoMetadata.findUnique({ where: { id } });
    if (!seo)
      throw new NotFoundException({
        message: 'SEO metadata not found',
        errorCode: 'SEO_NOT_FOUND',
      });
    return seo;
  }

  async findByEntity(entityType: SeoEntityType, entityId: string) {
    const seo = await this.prisma.seoMetadata.findUnique({
      where: {
        entityType_entityId: {
          entityType,
          entityId: this.normalizeEntityId(entityType, entityId),
        },
      },
    });
    if (!seo)
      throw new NotFoundException({
        message: 'SEO metadata not found',
        errorCode: 'SEO_NOT_FOUND',
      });
    return seo;
  }

  async create(dto: UpsertSeoDto) {
    const entityId = this.normalizeEntityId(dto.entityType, dto.entityId);
    const prepared = await this.prepareSeoData({ ...dto, entityId });
    return this.prisma.seoMetadata.create({ data: prepared });
  }

  async upsert(dto: UpsertSeoDto) {
    const entityId = this.normalizeEntityId(dto.entityType, dto.entityId);
    const prepared = await this.prepareSeoData({ ...dto, entityId });
    return this.prisma.seoMetadata.upsert({
      where: { entityType_entityId: { entityType: dto.entityType, entityId } },
      create: prepared,
      update: prepared,
    });
  }

  async update(id: string, dto: UpdateSeoDto) {
    const existing = await this.findOne(id);
    const entityType = dto.entityType ?? existing.entityType;
    const entityId = this.normalizeEntityId(
      entityType,
      dto.entityId ?? existing.entityId,
    );
    const prepared = await this.prepareSeoData({
      entityType,
      entityId,
      seoTitle: dto.seoTitle ?? existing.seoTitle ?? undefined,
      seoDescription:
        dto.seoDescription ?? existing.seoDescription ?? undefined,
      seoKeywords: dto.seoKeywords ?? existing.seoKeywords ?? undefined,
      canonicalUrl: dto.canonicalUrl ?? existing.canonicalUrl ?? undefined,
      ogTitle: dto.ogTitle ?? existing.ogTitle ?? undefined,
      ogDescription: dto.ogDescription ?? existing.ogDescription ?? undefined,
      ogImageUrl: dto.ogImageUrl ?? existing.ogImageUrl ?? undefined,
      twitterTitle: dto.twitterTitle ?? existing.twitterTitle ?? undefined,
      twitterDescription:
        dto.twitterDescription ?? existing.twitterDescription ?? undefined,
      twitterImageUrl:
        dto.twitterImageUrl ?? existing.twitterImageUrl ?? undefined,
      schemaType: dto.schemaType ?? existing.schemaType ?? undefined,
      noindex: dto.noindex ?? existing.noindex,
    });
    return this.prisma.seoMetadata.update({ where: { id }, data: prepared });
  }

  async remove(id: string) {
    const seo = await this.prisma.seoMetadata.findUnique({ where: { id } });
    if (!seo)
      throw new NotFoundException({
        message: 'SEO metadata not found',
        errorCode: 'SEO_NOT_FOUND',
      });
    return this.prisma.seoMetadata.delete({ where: { id } });
  }

  private normalizeEntityId(
    entityType: SeoEntityType,
    entityId?: string,
  ): string {
    if (entityType === SeoEntityType.HOME) return entityId || 'HOME';
    if (!entityId) {
      throw new BadRequestException({
        message: 'entityId is required for this SEO entity type',
        errorCode: 'SEO_ENTITY_ID_REQUIRED',
      });
    }
    return entityId;
  }

  private async prepareSeoData(dto: UpsertSeoDto & { entityId: string }) {
    const canonicalUrl =
      dto.canonicalUrl ??
      (await this.generateCanonicalUrl(dto.entityType, dto.entityId));
    const ogTitle = dto.ogTitle ?? dto.seoTitle;
    const ogDescription = dto.ogDescription ?? dto.seoDescription;

    return {
      entityType: dto.entityType,
      entityId: dto.entityId,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      seoKeywords: dto.seoKeywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImageUrl: dto.ogImageUrl,
      twitterTitle: dto.twitterTitle ?? ogTitle,
      twitterDescription: dto.twitterDescription ?? ogDescription,
      twitterImageUrl: dto.twitterImageUrl ?? dto.ogImageUrl,
      schemaType: dto.schemaType,
      noindex: dto.noindex ?? false,
    };
  }

  private async generateCanonicalUrl(
    entityType: SeoEntityType,
    entityId: string,
  ): Promise<string | undefined> {
    if (entityType === SeoEntityType.HOME) return this.frontendBaseUrl;
    if (entityType === SeoEntityType.PRODUCT) {
      const product = await this.prisma.product.findUnique({
        where: { id: entityId },
        select: { slug: true },
      });
      return product
        ? `${this.frontendBaseUrl}/products/${product.slug}`
        : undefined;
    }
    if (entityType === SeoEntityType.CATEGORY) {
      const category = await this.prisma.category.findUnique({
        where: { id: entityId },
        select: { slug: true },
      });
      return category
        ? `${this.frontendBaseUrl}/categories/${category.slug}`
        : undefined;
    }
    if (entityType === SeoEntityType.COLLECTION) {
      const collection = await this.prisma.collection.findUnique({
        where: { id: entityId },
        select: { slug: true },
      });
      return collection
        ? `${this.frontendBaseUrl}/collections/${collection.slug}`
        : undefined;
    }
    if (entityType === SeoEntityType.SERVICE) {
      const service = await this.prisma.service.findUnique({
        where: { id: entityId },
        select: { slug: true },
      });
      return service
        ? `${this.frontendBaseUrl}/services/${service.slug}`
        : undefined;
    }
    if (entityType === SeoEntityType.GUIDE) {
      const guide = await this.prisma.guide.findUnique({
        where: { id: entityId },
        select: { slug: true },
      });
      return guide ? `${this.frontendBaseUrl}/guides/${guide.slug}` : undefined;
    }
    return undefined;
  }
}
