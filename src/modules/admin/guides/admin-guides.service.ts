import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { generateSlug } from '../../../common/utils/slug.util';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';

@Injectable()
export class AdminGuidesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.guide.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const guide = await this.prisma.guide.findUnique({ where: { id } });
    if (!guide) {
      throw new NotFoundException({
        message: 'Guide not found',
        errorCode: 'GUIDE_NOT_FOUND',
      });
    }
    return guide;
  }

  async create(dto: CreateGuideDto) {
    const slug = dto.slug?.trim() || generateSlug(dto.title);
    const existing = await this.prisma.guide.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException({
        message: `Slug "${slug}" already exists`,
        errorCode: 'SLUG_CONFLICT',
      });
    }

    return this.prisma.guide.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        bodyHtml: dto.bodyHtml,
        coverImageUrl: dto.coverImageUrl,
        tags: dto.tags ?? [],
        status: dto.status ?? ProductStatus.DRAFT,
        publishedAt: dto.status === ProductStatus.PUBLISHED ? new Date() : null,
      },
    });
  }

  async update(id: string, dto: UpdateGuideDto) {
    const current = await this.findOne(id);

    if (dto.slug && dto.slug !== current.slug) {
      const existing = await this.prisma.guide.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException({
          message: `Slug "${dto.slug}" already exists`,
          errorCode: 'SLUG_CONFLICT',
        });
      }
    }

    let publishedAt = current.publishedAt;
    if (dto.status === ProductStatus.PUBLISHED && !current.publishedAt) {
      publishedAt = new Date();
    }

    return this.prisma.guide.update({
      where: { id },
      data: {
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        bodyHtml: dto.bodyHtml,
        coverImageUrl: dto.coverImageUrl,
        tags: dto.tags,
        status: dto.status,
        publishedAt,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.guide.delete({ where: { id } });
  }
}
