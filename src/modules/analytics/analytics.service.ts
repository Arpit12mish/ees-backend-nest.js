import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { TrackEventDto } from './dto/track-event.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(dto: TrackEventDto) {
    await this.prisma.analyticsEvent.create({
      data: {
        type: dto.type,
        visitorId: dto.visitorId,
        sessionId: dto.sessionId ?? null,
        path: dto.path ?? null,
        productId: dto.productId ?? null,
        categoryId: dto.categoryId ?? null,
        collectionId: dto.collectionId ?? null,
        searchQuery: dto.searchQuery ?? null,
        resultCount: dto.resultCount ?? null,
        metadata: (dto.metadata as Prisma.InputJsonValue) ?? undefined,
      },
    });
    return { recorded: true };
  }
}
