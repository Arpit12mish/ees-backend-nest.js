import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class AdminReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(isApproved?: boolean) {
    return this.prisma.review.findMany({
      where: isApproved === undefined ? undefined : { isApproved },
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { id: true, name: true, slug: true } } },
    });
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException({
        message: 'Review not found',
        errorCode: 'REVIEW_NOT_FOUND',
      });
    }
    return review;
  }

  async update(id: string, dto: UpdateReviewDto) {
    await this.findOne(id);
    return this.prisma.review.update({
      where: { id },
      data: { isApproved: dto.isApproved },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.review.delete({ where: { id } });
  }
}
