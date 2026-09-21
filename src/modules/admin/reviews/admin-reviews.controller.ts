import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { AdminReviewsService } from './admin-reviews.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminReviewsController {
  constructor(private readonly service: AdminReviewsService) {}

  @Get()
  async findAll(@Query('isApproved') isApproved?: string) {
    const data = await this.service.findAll(
      isApproved === undefined ? undefined : isApproved === 'true',
    );
    return { success: true, message: 'Reviews fetched', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, message: 'Review fetched', data };
  }

  @Patch(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  async update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    const data = await this.service.update(id, dto);
    return { success: true, message: 'Review updated', data };
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true, message: 'Review deleted', data: null };
  }
}
