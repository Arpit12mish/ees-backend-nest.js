import { Injectable } from '@nestjs/common';
import { FaqEntityType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FaqsService {
  constructor(private readonly prisma: PrismaService) {}

  async findGlobal() {
    return this.prisma.faq.findMany({
      where: { entityType: FaqEntityType.GLOBAL, isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, question: true, answer: true },
    });
  }

  async findForEntity(entityType: FaqEntityType, entityId: string) {
    return this.prisma.faq.findMany({
      where: { entityType, entityId, isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, question: true, answer: true },
    });
  }
}
