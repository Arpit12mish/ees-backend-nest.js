import { Module } from '@nestjs/common';
import { HeroReelsController } from './hero-reels.controller';
import { HeroReelsService } from './hero-reels.service';

@Module({
  controllers: [HeroReelsController],
  providers: [HeroReelsService],
})
export class HeroReelsModule {}
