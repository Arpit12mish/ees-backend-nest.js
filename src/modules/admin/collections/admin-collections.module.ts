import { Module } from '@nestjs/common';
import { AdminCollectionsController } from './admin-collections.controller';
import { AdminCollectionsService } from './admin-collections.service';

@Module({
  controllers: [AdminCollectionsController],
  providers: [AdminCollectionsService],
})
export class AdminCollectionsModule {}
