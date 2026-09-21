import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SeoService } from './seo.service';
import { CACHE_HEADERS } from '../../common/constants/cache.constants';

@Controller()
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('public/seo/product/:slug')
  async productSeo(@Param('slug') slug: string, @Res() res: Response) {
    const data = await this.seoService.getProductSeo(slug);
    res.setHeader('Cache-Control', CACHE_HEADERS.PRODUCT_DETAIL);
    return res.json({
      success: true,
      message: 'SEO metadata fetched successfully',
      data,
    });
  }

  @Get('public/seo/category/:slug')
  async categorySeo(@Param('slug') slug: string, @Res() res: Response) {
    const data = await this.seoService.getCategorySeo(slug);
    res.setHeader('Cache-Control', CACHE_HEADERS.CATEGORY_LIST);
    return res.json({
      success: true,
      message: 'SEO metadata fetched successfully',
      data,
    });
  }

  @Get('public/seo/collection/:slug')
  async collectionSeo(@Param('slug') slug: string, @Res() res: Response) {
    const data = await this.seoService.getCollectionSeo(slug);
    res.setHeader('Cache-Control', CACHE_HEADERS.COLLECTION_LIST);
    return res.json({
      success: true,
      message: 'SEO metadata fetched successfully',
      data,
    });
  }

  @Get('public/seo/service/:slug')
  async serviceSeo(@Param('slug') slug: string, @Res() res: Response) {
    const data = await this.seoService.getServiceSeo(slug);
    res.setHeader('Cache-Control', CACHE_HEADERS.SERVICE_LIST);
    return res.json({
      success: true,
      message: 'SEO metadata fetched successfully',
      data,
    });
  }

  @Get('public/seo/guide/:slug')
  async guideSeo(@Param('slug') slug: string, @Res() res: Response) {
    const data = await this.seoService.getGuideSeo(slug);
    res.setHeader('Cache-Control', CACHE_HEADERS.PRODUCT_DETAIL);
    return res.json({
      success: true,
      message: 'SEO metadata fetched successfully',
      data,
    });
  }

  @Get('public/seo/product-schema/:slug')
  async productSchema(@Param('slug') slug: string, @Res() res: Response) {
    const data = await this.seoService.getProductSchema(slug);
    res.setHeader('Cache-Control', CACHE_HEADERS.PRODUCT_DETAIL);
    return res.json({
      success: true,
      message: 'Product schema fetched successfully',
      data,
    });
  }

  @Get('public/merchant-feed.xml')
  async merchantFeed(@Res() res: Response) {
    const xml = await this.seoService.getMerchantFeedXml();
    res.setHeader('Cache-Control', CACHE_HEADERS.MERCHANT_FEED);
    res.setHeader('Content-Type', 'application/xml');
    return res.send(xml);
  }

  @Get('public/sitemap-data')
  async sitemapData(@Res() res: Response) {
    const data = await this.seoService.getSitemapData();
    res.setHeader('Cache-Control', CACHE_HEADERS.SITEMAP);
    return res.json({
      success: true,
      message: 'Sitemap data fetched successfully',
      data,
    });
  }
}
