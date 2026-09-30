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
import { AdminHeroReelsService } from './admin-hero-reels.service';
import { CreateHeroReelDto } from './dto/create-hero-reel.dto';
import { UpdateHeroReelDto } from './dto/update-hero-reel.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('admin/hero-reels')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminHeroReelsController {
  constructor(private readonly service: AdminHeroReelsService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { success: true, message: 'Hero reels fetched', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, message: 'Hero reel fetched', data };
  }

  @Post()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  async create(@Body() dto: CreateHeroReelDto) {
    const data = await this.service.create(dto);
    return { success: true, message: 'Hero reel created', data };
  }

  @Patch(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  async update(@Param('id') id: string, @Body() dto: UpdateHeroReelDto) {
    const data = await this.service.update(id, dto);
    return { success: true, message: 'Hero reel updated', data };
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true, message: 'Hero reel deleted', data: null };
  }
}
