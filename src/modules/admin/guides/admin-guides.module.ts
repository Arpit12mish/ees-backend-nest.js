import { Module } from '@nestjs/common';
import { AdminGuidesController } from './admin-guides.controller';
import { AdminGuidesService } from './admin-guides.service';

@Module({
  controllers: [AdminGuidesController],
  providers: [AdminGuidesService],
})
export class AdminGuidesModule {}
