import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminRole, ProductStatus } from '@prisma/client';
import { AdminProductsService } from './admin-products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  CreateProductImageDto,
  UpdateProductImageDto,
} from './dto/product-image.dto';
import { AdminProductQueryDto } from './dto/admin-product-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { IsEnum } from 'class-validator';

class UpdateStatusDto {
  @IsEnum(ProductStatus)
  status: ProductStatus;
}

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminProductsController {
  constructor(private readonly service: AdminProductsService) {}

  @Get()
  async findAll(@Query() query: AdminProductQueryDto) {
    const data = await this.service.findAll(query);
    return { success: true, message: 'Products fetched', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, message: 'Product fetched', data };
  }

  @Post()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  async create(@Body() dto: CreateProductDto) {
    const data = await this.service.create(dto);
    return { success: true, message: 'Product created', data };
  }

  @Patch(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const data = await this.service.update(id, dto);
    return { success: true, message: 'Product updated', data };
  }

  @Patch(':id/status')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    const data = await this.service.updateStatus(id, dto.status);
    return { success: true, message: 'Product status updated', data };
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true, message: 'Product deactivated', data: null };
  }

  // --- Product Images ---

  @Get(':productId/images')
  async getImages(@Param('productId') productId: string) {
    const data = await this.service.getImages(productId);
    return { success: true, message: 'Images fetched', data };
  }

  @Post(':productId/images')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  async addImage(
    @Param('productId') productId: string,
    @Body() dto: CreateProductImageDto,
  ) {
    const data = await this.service.addImage(productId, dto);
    return { success: true, message: 'Image added', data };
  }
}

@Controller('admin/product-images')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminProductImagesController {
  constructor(private readonly service: AdminProductsService) {}

  @Patch(':imageId')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  async updateImage(
    @Param('imageId') imageId: string,
    @Body() dto: UpdateProductImageDto,
  ) {
    const data = await this.service.updateImage(imageId, dto);
    return { success: true, message: 'Image updated', data };
  }

  @Delete(':imageId')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async removeImage(@Param('imageId') imageId: string) {
    await this.service.removeImage(imageId);
    return { success: true, message: 'Image removed', data: null };
  }

  @Patch(':imageId/primary')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  async setPrimary(@Param('imageId') imageId: string) {
    const data = await this.service.setPrimaryImage(imageId);
    return { success: true, message: 'Primary image set', data };
  }
}
