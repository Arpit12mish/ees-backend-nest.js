import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';

@Controller('public/analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Post('events')
  @Throttle({ default: { ttl: 60000, limit: 60 } })
  async track(@Body() dto: TrackEventDto) {
    const data = await this.service.record(dto);
    return { success: true, message: 'Event recorded', data };
  }
}
