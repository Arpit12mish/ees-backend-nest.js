import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { ResetAdminPasswordDto } from './dto/reset-admin-password.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import {
  CurrentAdmin,
  type AdminPayload,
} from '../../auth/decorators/current-admin.decorator';

// The whole controller is SUPER_ADMIN-only, including reads — unlike every
// other admin module (where GET is open to any authenticated role), the
// existence and email addresses of other admin/partner accounts is itself
// sensitive and shouldn't be visible to, e.g., a PARTNER or EDITOR.
@Controller('admin/admin-users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN)
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { success: true, message: 'Admin accounts fetched', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, message: 'Admin account fetched', data };
  }

  @Post()
  async create(@Body() dto: CreateAdminUserDto) {
    const data = await this.service.create(dto);
    return { success: true, message: 'Admin account created', data };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
    @CurrentAdmin() currentAdmin: AdminPayload,
  ) {
    const data = await this.service.update(id, dto, currentAdmin.sub);
    return { success: true, message: 'Admin account updated', data };
  }

  @Patch(':id/reset-password')
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetAdminPasswordDto,
  ) {
    const data = await this.service.resetPassword(id, dto);
    return { success: true, message: 'Password reset', data };
  }
}
