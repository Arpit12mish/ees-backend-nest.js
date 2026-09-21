import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('public/products')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':slug/reviews')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async create(@Param('slug') slug: string, @Body() dto: CreateReviewDto) {
    const data = await this.reviewsService.create(slug, dto);
    return {
      success: true,
      message: 'Review submitted and pending approval',
      data,
    };
  }

  @Get(':slug/reviews')
  async findApproved(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.reviewsService.findApproved(
      slug,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
    return { success: true, message: 'Reviews fetched successfully', data };
  }
}
