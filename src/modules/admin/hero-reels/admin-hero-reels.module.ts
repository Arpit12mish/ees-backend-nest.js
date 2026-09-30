import { Module } from '@nestjs/common';
import { AdminHeroReelsController } from './admin-hero-reels.controller';
import { AdminHeroReelsService } from './admin-hero-reels.service';

@Module({
  controllers: [AdminHeroReelsController],
  providers: [AdminHeroReelsService],
})
export class AdminHeroReelsModule {}
