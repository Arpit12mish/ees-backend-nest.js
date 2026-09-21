import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseEnumPipe,
} from '@nestjs/common';
import { AdminRole, SeoEntityType } from '@prisma/client';
import { AdminSeoService } from './admin-seo.service';
import { UpsertSeoDto } from './dto/upsert-seo.dto';
import { UpdateSeoDto } from './dto/update-seo.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('admin/seo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminSeoController {
  constructor(private readonly service: AdminSeoService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { success: true, message: 'SEO metadata fetched', data };
  }

  @Get('entity/:entityType/:entityId')
  async findByEntity(
    @Param('entityType', new ParseEnumPipe(SeoEntityType))
    entityType: SeoEntityType,
    @Param('entityId') entityId: string,
  ) {
    const data = await this.service.findByEntity(entityType, entityId);
    return { success: true, message: 'SEO metadata fetched', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, message: 'SEO metadata fetched', data };
  }

  @Post()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  async create(@Body() dto: UpsertSeoDto) {
    const data = await this.service.create(dto);
    return { success: true, message: 'SEO metadata created', data };
  }

  @Put()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  async upsert(@Body() dto: UpsertSeoDto) {
    const data = await this.service.upsert(dto);
    return { success: true, message: 'SEO metadata saved', data };
  }

  @Patch(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  async update(@Param('id') id: string, @Body() dto: UpdateSeoDto) {
    const data = await this.service.update(id, dto);
    return { success: true, message: 'SEO metadata updated', data };
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true, message: 'SEO metadata deleted', data: null };
  }
}
