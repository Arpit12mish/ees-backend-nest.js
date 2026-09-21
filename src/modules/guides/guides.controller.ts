import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { GuidesService } from './guides.service';
import { CACHE_HEADERS } from '../../common/constants/cache.constants';

@Controller('public/guides')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @Get()
  async findAll(
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('tags') tags: string | undefined,
    @Query('exclude') exclude: string | undefined,
    @Res() res: Response,
  ) {
    const data = await this.guidesService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      {
        tags: tags ? tags.split(',').filter(Boolean) : undefined,
        excludeSlug: exclude,
      },
    );
    res.setHeader('Cache-Control', CACHE_HEADERS.PRODUCT_LIST);
    return res.json({ success: true, message: 'Guides fetched', data });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string, @Res() res: Response) {
    const data = await this.guidesService.findBySlug(slug);
    res.setHeader('Cache-Control', CACHE_HEADERS.PRODUCT_DETAIL);
    return res.json({ success: true, message: 'Guide fetched', data });
  }
}
