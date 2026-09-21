import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ContactService } from './contact.service';
import { UpdateContactLeadStatusDto } from './dto/update-contact-lead-status.dto';

@Controller('admin/contact-leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminContactController {
  constructor(private readonly service: ContactService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { success: true, message: 'Contact leads fetched', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, message: 'Contact lead fetched', data };
  }

  @Patch(':id/status')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContactLeadStatusDto,
  ) {
    const data = await this.service.updateStatus(id, dto);
    return { success: true, message: 'Status updated', data };
  }
}
