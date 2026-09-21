import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CollectionsService } from './collections.service';
import { CACHE_HEADERS } from '../../common/constants/cache.constants';

class CollectionProductsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}

@Controller('public/collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  async findAll(@Res() res: Response) {
    const data = await this.collectionsService.findAll();
    res.setHeader('Cache-Control', CACHE_HEADERS.COLLECTION_LIST);
    return res.json({
      success: true,
      message: 'Collections fetched successfully',
      data,
    });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string, @Res() res: Response) {
    const data = await this.collectionsService.findBySlug(slug);
    res.setHeader('Cache-Control', CACHE_HEADERS.COLLECTION_LIST);
    return res.json({
      success: true,
      message: 'Collection fetched successfully',
      data,
    });
  }

  @Get(':slug/products')
  async findProducts(
    @Param('slug') slug: string,
    @Query() query: CollectionProductsQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.collectionsService.findProductsBySlug(
      slug,
      query.page,
      query.limit,
    );
    res.setHeader('Cache-Control', CACHE_HEADERS.PRODUCT_LIST);
    return res.json({
      success: true,
      message: 'Collection products fetched successfully',
      data,
    });
  }
}
