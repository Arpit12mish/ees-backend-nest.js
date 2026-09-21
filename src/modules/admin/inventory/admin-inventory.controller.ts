import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminInventoryService } from './admin-inventory.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('admin/inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminInventoryController {
  constructor(private readonly service: AdminInventoryService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { success: true, message: 'Inventory fetched', data };
  }

  @Get('low-stock')
  async findLowStock() {
    const data = await this.service.findLowStock();
    return { success: true, message: 'Low-stock inventory fetched', data };
  }

  @Patch(':productId')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async update(
    @Param('productId') productId: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    const data = await this.service.update(productId, dto);
    return { success: true, message: 'Inventory updated', data };
  }
}
