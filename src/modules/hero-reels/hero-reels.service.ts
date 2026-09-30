import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HeroReelsService {
  constructor(private readonly prisma: PrismaService) {}

  async findActive() {
    const reels = await this.prisma.heroReel.findMany({
      where: {
        isActive: true,
        OR: [{ productId: null }, { product: { status: 'PUBLISHED' } }],
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            mrp: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { cardUrl: true, imageUrl: true },
            },
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return reels.map((reel) => ({
      id: reel.id,
      videoUrl: reel.videoUrl,
      posterUrl: reel.posterUrl,
      altText: reel.altText,
      product: reel.product
        ? {
            id: reel.product.id,
            name: reel.product.name,
            slug: reel.product.slug,
            price: Number(reel.product.price),
            mrp: Number(reel.product.mrp),
            image:
              reel.product.images[0]?.cardUrl ??
              reel.product.images[0]?.imageUrl ??
              null,
          }
        : null,
    }));
  }
}
