import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ priority: 'desc' }, { name: 'asc' }],
    });
  }

  async findBySlug(slug: string) {
    const service = await this.prisma.service.findFirst({
      where: { slug, isActive: true },
    });
    if (!service) {
      throw new NotFoundException({
        message: 'Service not found',
        errorCode: 'SERVICE_NOT_FOUND',
      });
    }
    return service;
  }

  async createBooking(serviceId: string, dto: CreateBookingDto) {
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, isActive: true },
    });
    if (!service) {
      throw new NotFoundException({
        message: 'Service not found',
        errorCode: 'SERVICE_NOT_FOUND',
      });
    }

    return this.prisma.serviceBooking.create({
      data: {
        serviceId: service.id,
        name: dto.name,
        email: dto.email,
        phone: dto.phone ?? null,
        message: dto.message ?? null,
      },
    });
  }
}
