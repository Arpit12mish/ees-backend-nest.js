import { Injectable, NotFoundException } from '@nestjs/common';
import { FaqEntityType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class AdminFaqsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.faq.findMany({
      orderBy: [{ entityType: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async findOne(id: string) {
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq) {
      throw new NotFoundException({
        message: 'FAQ not found',
        errorCode: 'FAQ_NOT_FOUND',
      });
    }
    return faq;
  }

  async create(dto: CreateFaqDto) {
    return this.prisma.faq.create({
      data: {
        entityType: dto.entityType,
        entityId: dto.entityType === FaqEntityType.GLOBAL ? null : dto.entityId,
        question: dto.question,
        answer: dto.answer,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateFaqDto) {
    await this.findOne(id);
    return this.prisma.faq.update({
      where: { id },
      data: {
        entityType: dto.entityType,
        entityId: dto.entityType === FaqEntityType.GLOBAL ? null : dto.entityId,
        question: dto.question,
        answer: dto.answer,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.faq.delete({ where: { id } });
  }
}
