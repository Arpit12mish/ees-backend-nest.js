import { Controller, Get, Param, ParseEnumPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { FaqEntityType } from '@prisma/client';
import { FaqsService } from './faqs.service';
import { CACHE_HEADERS } from '../../common/constants/cache.constants';

@Controller('public/faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get('global')
  async findGlobal(@Res() res: Response) {
    const data = await this.faqsService.findGlobal();
    res.setHeader('Cache-Control', CACHE_HEADERS.CATEGORY_LIST);
    return res.json({ success: true, message: 'FAQs fetched', data });
  }

  @Get(':entityType/:entityId')
  async findForEntity(
    @Param('entityType', new ParseEnumPipe(FaqEntityType))
    entityType: FaqEntityType,
    @Param('entityId') entityId: string,
    @Res() res: Response,
  ) {
    const data = await this.faqsService.findForEntity(entityType, entityId);
    res.setHeader('Cache-Control', CACHE_HEADERS.CATEGORY_LIST);
    return res.json({ success: true, message: 'FAQs fetched', data });
  }
}
