import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { generateSlug } from '../../../common/utils/slug.util';

@Injectable()
export class AdminServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.service.findMany({
      orderBy: [{ priority: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service)
      throw new NotFoundException({
        message: 'Service not found',
        errorCode: 'SERVICE_NOT_FOUND',
      });
    return service;
  }

  async create(dto: CreateServiceDto) {
    const slug = dto.slug ?? generateSlug(dto.name);
    const existing = await this.prisma.service.findUnique({ where: { slug } });
    if (existing)
      throw new ConflictException({
        message: `Slug "${slug}" already exists`,
        errorCode: 'SLUG_CONFLICT',
      });
    return this.prisma.service.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        priceLabel: dto.priceLabel,
        priority: dto.priority ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findOne(id);
    const slug = dto.slug ?? (dto.name ? generateSlug(dto.name) : undefined);
    if (slug) {
      const existing = await this.prisma.service.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing)
        throw new ConflictException({
          message: `Slug "${slug}" already exists`,
          errorCode: 'SLUG_CONFLICT',
        });
    }
    return this.prisma.service.update({
      where: { id },
      data: { ...dto, ...(slug ? { slug } : {}) },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // --- Bookings ---

  async findAllBookings() {
    return this.prisma.serviceBooking.findMany({
      include: { service: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneBooking(id: string) {
    const booking = await this.prisma.serviceBooking.findUnique({
      where: { id },
      include: { service: { select: { id: true, name: true, slug: true } } },
    });
    if (!booking)
      throw new NotFoundException({
        message: 'Booking not found',
        errorCode: 'SERVICE_BOOKING_NOT_FOUND',
      });
    return booking;
  }

  async updateBookingStatus(id: string, dto: UpdateBookingStatusDto) {
    await this.findOneBooking(id);
    return this.prisma.serviceBooking.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
