import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { AdminServicesService } from './admin-services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('admin/services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminServicesController {
  constructor(private readonly service: AdminServicesService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { success: true, message: 'Services fetched', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, message: 'Service fetched', data };
  }

  @Post()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async create(@Body() dto: CreateServiceDto) {
    const data = await this.service.create(dto);
    return { success: true, message: 'Service created', data };
  }

  @Patch(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    const data = await this.service.update(id, dto);
    return { success: true, message: 'Service updated', data };
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true, message: 'Service deactivated', data: null };
  }
}

@Controller('admin/service-bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminServiceBookingsController {
  constructor(private readonly service: AdminServicesService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAllBookings();
    return { success: true, message: 'Service bookings fetched', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOneBooking(id);
    return { success: true, message: 'Service booking fetched', data };
  }

  @Patch(':id/status')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    const data = await this.service.updateBookingStatus(id, dto);
    return { success: true, message: 'Status updated', data };
  }
}
