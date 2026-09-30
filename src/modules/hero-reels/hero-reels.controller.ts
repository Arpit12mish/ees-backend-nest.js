import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { HeroReelsService } from './hero-reels.service';
import { CACHE_HEADERS } from '../../common/constants/cache.constants';

@Controller('public/hero-reels')
export class HeroReelsController {
  constructor(private readonly heroReelsService: HeroReelsService) {}

  @Get()
  async findAll(@Res() res: Response) {
    const data = await this.heroReelsService.findActive();
    res.setHeader('Cache-Control', CACHE_HEADERS.HERO_REEL_LIST);
    return res.json({
      success: true,
      message: 'Hero reels fetched successfully',
      data,
    });
  }
}
