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
import { AdminCategoriesService } from './admin-categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminCategoriesController {
  constructor(private readonly service: AdminCategoriesService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { success: true, message: 'Categories fetched', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, message: 'Category fetched', data };
  }

  @Post()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async create(@Body() dto: CreateCategoryDto) {
    const data = await this.service.create(dto);
    return { success: true, message: 'Category created', data };
  }

  @Patch(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const data = await this.service.update(id, dto);
    return { success: true, message: 'Category updated', data };
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true, message: 'Category deactivated', data: null };
  }
}
