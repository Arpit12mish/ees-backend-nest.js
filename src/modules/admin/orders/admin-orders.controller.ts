import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import {
  CurrentAdmin,
  type AdminPayload,
} from '../../auth/decorators/current-admin.decorator';
import { AdminOrdersService } from './admin-orders.service';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import {
  CancelOrderDto,
  UpdateOrderStatusDto,
} from './dto/update-order-status.dto';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminOrdersController {
  constructor(private readonly service: AdminOrdersService) {}

  @Get()
  async findAll(@Query() query: AdminOrderQueryDto) {
    const data = await this.service.findAll(query);
    return { success: true, message: 'Orders fetched', data };
  }

  @Get('order-number/:orderNumber')
  async findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    const data = await this.service.findByOrderNumber(orderNumber);
    return { success: true, message: 'Order fetched', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, message: 'Order fetched', data };
  }

  @Patch(':id/status')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentAdmin() admin: AdminPayload,
  ) {
    const data = await this.service.updateStatus(
      id,
      dto,
      admin.sub,
      admin.role,
    );
    return { success: true, message: 'Order status updated', data };
  }

  @Patch(':id/cancel')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
    @CurrentAdmin() admin: AdminPayload,
  ) {
    const data = await this.service.cancelOrder(id, dto, admin.sub, admin.role);
    return { success: true, message: 'Order cancelled', data };
  }
}
