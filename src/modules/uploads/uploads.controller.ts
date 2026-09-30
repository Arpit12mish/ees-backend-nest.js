import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UploadsService } from './uploads.service';

@Controller('admin/uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadsController {
  constructor(private readonly service: UploadsService) {}

  @Post('image')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file?: Express.Multer.File) {
    const data = await this.service.uploadImage(file);
    return { success: true, message: 'Image uploaded successfully', data };
  }

  @Post('video')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR)
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file?: Express.Multer.File) {
    const data = await this.service.uploadVideo(file);
    return { success: true, message: 'Video uploaded successfully', data };
  }
}
