import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  getPaginationParams,
  paginate,
} from '../../common/utils/pagination.util';

@Injectable()
export class GuidesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number,
    limit: number,
    options?: { tags?: string[]; excludeSlug?: string },
  ) {
    const {
      skip,
      take,
      page: safePage,
      limit: safeLimit,
    } = getPaginationParams(page, limit);
    const where = {
      status: 'PUBLISHED' as const,
      ...(options?.tags?.length ? { tags: { hasSome: options.tags } } : {}),
      ...(options?.excludeSlug ? { slug: { not: options.excludeSlug } } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.guide.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImageUrl: true,
          tags: true,
          publishedAt: true,
        },
      }),
      this.prisma.guide.count({ where }),
    ]);

    return paginate(items, total, safePage, safeLimit);
  }

  async findBySlug(slug: string) {
    const guide = await this.prisma.guide.findFirst({
      where: { slug, status: 'PUBLISHED' },
    });
    if (!guide) {
      throw new NotFoundException({
        message: 'Guide not found',
        errorCode: 'GUIDE_NOT_FOUND',
      });
    }
    return guide;
  }
}
