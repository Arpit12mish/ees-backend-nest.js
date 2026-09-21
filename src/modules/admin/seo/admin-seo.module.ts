import { Module } from '@nestjs/common';
import { AdminSeoController } from './admin-seo.controller';
import { AdminSeoService } from './admin-seo.service';

@Module({
  controllers: [AdminSeoController],
  providers: [AdminSeoService],
})
export class AdminSeoModule {}
