import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CategoriesService } from './categories.service';
import { CategoryQueryDto } from './dto/category.dto';
import { CACHE_HEADERS } from '../../common/constants/cache.constants';

@Controller('public/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Query() query: CategoryQueryDto, @Res() res: Response) {
    const data = await this.categoriesService.findAll(query.page, query.limit);
    res.setHeader('Cache-Control', CACHE_HEADERS.CATEGORY_LIST);
    return res.json({
      success: true,
      message: 'Categories fetched successfully',
      data,
    });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string, @Res() res: Response) {
    const data = await this.categoriesService.findBySlug(slug);
    res.setHeader('Cache-Control', CACHE_HEADERS.CATEGORY_LIST);
    return res.json({
      success: true,
      message: 'Category fetched successfully',
      data,
    });
  }
}
