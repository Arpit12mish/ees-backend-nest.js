import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { ServicesService } from './services.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CACHE_HEADERS } from '../../common/constants/cache.constants';

@Controller('public/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async findAll(@Res() res: Response) {
    const data = await this.servicesService.findAll();
    res.setHeader('Cache-Control', CACHE_HEADERS.SERVICE_LIST);
    return res.json({
      success: true,
      message: 'Services fetched successfully',
      data,
    });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string, @Res() res: Response) {
    const data = await this.servicesService.findBySlug(slug);
    res.setHeader('Cache-Control', CACHE_HEADERS.SERVICE_LIST);
    return res.json({
      success: true,
      message: 'Service fetched successfully',
      data,
    });
  }

  @Post(':id/bookings')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async createBooking(@Param('id') id: string, @Body() dto: CreateBookingDto) {
    const data = await this.servicesService.createBooking(id, dto);
    return { success: true, message: 'Booking request received', data };
  }
}
