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

  // Orders carry customer PII and payment state, so — unlike most other
  // admin modules — reads are role-gated too, not just writes. Explicitly
  // excludes PARTNER: a product partner has no legitimate reason to see
  // order/customer data. SUPER_ADMIN/ADMIN/EDITOR access is unchanged from
  // before this controller had explicit @Roles on its GET routes.
  @Get()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  async findAll(@Query() query: AdminOrderQueryDto) {
    const data = await this.service.findAll(query);
    return { success: true, message: 'Orders fetched', data };
  }

  @Get('order-number/:orderNumber')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  async findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    const data = await this.service.findByOrderNumber(orderNumber);
    return { success: true, message: 'Order fetched', data };
  }

  @Get(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
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
