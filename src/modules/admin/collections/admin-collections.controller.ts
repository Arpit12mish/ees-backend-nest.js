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
import { AdminCollectionsService } from './admin-collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import {
  AddCollectionProductDto,
  BulkAddCollectionProductsDto,
  ReorderCollectionProductDto,
} from './dto/collection-product.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('admin/collections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminCollectionsController {
  constructor(private readonly service: AdminCollectionsService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { success: true, message: 'Collections fetched', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, message: 'Collection fetched', data };
  }

  @Post()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async create(@Body() dto: CreateCollectionDto) {
    const data = await this.service.create(dto);
    return { success: true, message: 'Collection created', data };
  }

  @Patch(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateCollectionDto) {
    const data = await this.service.update(id, dto);
    return { success: true, message: 'Collection updated', data };
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true, message: 'Collection deactivated', data: null };
  }

  // --- Collection Products ---

  @Post(':id/products')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  async addProduct(
    @Param('id') id: string,
    @Body() dto: AddCollectionProductDto,
  ) {
    const data = await this.service.addProduct(id, dto);
    return { success: true, message: 'Product added to collection', data };
  }

  @Post(':id/products/bulk')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  async bulkAddProducts(
    @Param('id') id: string,
    @Body() dto: BulkAddCollectionProductsDto,
  ) {
    const data = await this.service.bulkAddProducts(id, dto);
    return { success: true, message: 'Products added to collection', data };
  }

  @Delete(':id/products/:productId')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async removeProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    await this.service.removeProduct(id, productId);
    return {
      success: true,
      message: 'Product removed from collection',
      data: null,
    };
  }

  @Patch(':id/products/:productId/sort-order')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  async updateProductSortOrder(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Body() dto: ReorderCollectionProductDto,
  ) {
    const data = await this.service.updateProductSortOrder(id, productId, dto);
    return {
      success: true,
      message: 'Collection product sort order updated',
      data,
    };
  }
}
