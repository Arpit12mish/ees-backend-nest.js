import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminAnalyticsController {
  constructor(private readonly service: AdminAnalyticsService) {}

  @Get('overview')
  async overview(@Query() query: AnalyticsQueryDto) {
    const data = await this.service.getOverview(query.days);
    return { success: true, message: 'Analytics overview fetched', data };
  }

  @Get('products')
  async products(@Query() query: AnalyticsQueryDto) {
    const data = await this.service.getProducts(query.days, query.limit);
    return { success: true, message: 'Product analytics fetched', data };
  }

  @Get('searches')
  async searches(@Query() query: AnalyticsQueryDto) {
    const data = await this.service.getSearches(query.days, query.limit);
    return { success: true, message: 'Search analytics fetched', data };
  }

  @Get('cart-abandonment')
  async cartAbandonment(@Query() query: AnalyticsQueryDto) {
    const data = await this.service.getCartAbandonment(query.hours);
    return {
      success: true,
      message: 'Cart abandonment analytics fetched',
      data,
    };
  }
}
