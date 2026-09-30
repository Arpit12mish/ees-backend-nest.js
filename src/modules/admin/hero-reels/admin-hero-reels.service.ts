import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateHeroReelDto } from './dto/create-hero-reel.dto';
import { UpdateHeroReelDto } from './dto/update-hero-reel.dto';

const PRODUCT_SUMMARY_SELECT = {
  id: true,
  name: true,
  slug: true,
  price: true,
  images: {
    where: { isPrimary: true },
    take: 1,
    select: { cardUrl: true, imageUrl: true },
  },
} as const;

@Injectable()
export class AdminHeroReelsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.heroReel.findMany({
      include: { product: { select: PRODUCT_SUMMARY_SELECT } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const reel = await this.prisma.heroReel.findUnique({
      where: { id },
      include: { product: { select: PRODUCT_SUMMARY_SELECT } },
    });
    if (!reel)
      throw new NotFoundException({
        message: 'Hero reel not found',
        errorCode: 'HERO_REEL_NOT_FOUND',
      });
    return reel;
  }

  async create(dto: CreateHeroReelDto) {
    return this.prisma.heroReel.create({
      data: {
        videoUrl: dto.videoUrl,
        posterUrl: dto.posterUrl,
        altText: dto.altText,
        productId: dto.productId || null,
        priority: dto.priority ?? 0,
        isActive: dto.isActive ?? true,
      },
      include: { product: { select: PRODUCT_SUMMARY_SELECT } },
    });
  }

  async update(id: string, dto: UpdateHeroReelDto) {
    await this.findOne(id);
    return this.prisma.heroReel.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.productId !== undefined
          ? { productId: dto.productId || null }
          : {}),
      },
      include: { product: { select: PRODUCT_SUMMARY_SELECT } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.heroReel.delete({ where: { id } });
  }
}
