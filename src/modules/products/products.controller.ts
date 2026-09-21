import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { ProductQueryDto, ProductSearchDto } from './dto/product-query.dto';
import { CACHE_HEADERS } from '../../common/constants/cache.constants';

@Controller('public/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: ProductQueryDto, @Res() res: Response) {
    const data = await this.productsService.findAll(query);
    res.setHeader('Cache-Control', CACHE_HEADERS.PRODUCT_LIST);
    return res.json({
      success: true,
      message: 'Products fetched successfully',
      data,
    });
  }

  @Get('featured')
  async findFeatured(@Res() res: Response) {
    const data = await this.productsService.findFeatured();
    res.setHeader('Cache-Control', CACHE_HEADERS.PRODUCT_LIST);
    return res.json({
      success: true,
      message: 'Featured products fetched successfully',
      data,
    });
  }

  @Get('search')
  async search(@Query() query: ProductSearchDto, @Res() res: Response) {
    const data = await this.productsService.search(
      query.q,
      query.page,
      query.limit,
    );
    res.setHeader('Cache-Control', CACHE_HEADERS.PRODUCT_LIST);
    return res.json({
      success: true,
      message: 'Search results fetched successfully',
      data,
    });
  }

  @Get('category/:categorySlug')
  async findByCategory(
    @Param('categorySlug') categorySlug: string,
    @Query() query: ProductQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.productsService.findByCategory(categorySlug, query);
    res.setHeader('Cache-Control', CACHE_HEADERS.PRODUCT_LIST);
    return res.json({
      success: true,
      message: 'Products fetched successfully',
      data,
    });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string, @Res() res: Response) {
    const data = await this.productsService.findBySlug(slug);
    res.setHeader('Cache-Control', CACHE_HEADERS.PRODUCT_DETAIL);
    return res.json({
      success: true,
      message: 'Product fetched successfully',
      data,
    });
  }
}
