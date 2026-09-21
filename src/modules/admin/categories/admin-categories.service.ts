import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { generateSlug } from '../../../common/utils/slug.util';

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: [{ priority: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category)
      throw new NotFoundException({
        message: 'Category not found',
        errorCode: 'CATEGORY_NOT_FOUND',
      });
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug ?? generateSlug(dto.name);
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing)
      throw new ConflictException({
        message: `Slug "${slug}" already exists`,
        errorCode: 'SLUG_CONFLICT',
      });
    return this.prisma.category.create({
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

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    const slug = dto.slug ?? (dto.name ? generateSlug(dto.name) : undefined);
    if (slug) {
      const existing = await this.prisma.category.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing)
        throw new ConflictException({
          message: `Slug "${slug}" already exists`,
          errorCode: 'SLUG_CONFLICT',
        });
    }
    return this.prisma.category.update({
      where: { id },
      data: { ...dto, ...(slug ? { slug } : {}) },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
