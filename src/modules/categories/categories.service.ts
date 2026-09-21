import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  paginate,
  getPaginationParams,
} from '../../common/utils/pagination.util';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 50) {
    const { skip, take } = getPaginationParams(page, limit);
    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ priority: 'desc' }, { name: 'asc' }],
        skip,
        take,
      }),
      this.prisma.category.count({ where: { isActive: true } }),
    ]);
    return paginate(items, total, page, limit);
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: { slug, isActive: true },
    });
    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
        errorCode: 'CATEGORY_NOT_FOUND',
      });
    }
    return category;
  }
}
