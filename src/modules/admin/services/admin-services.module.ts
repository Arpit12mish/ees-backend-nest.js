import { Module } from '@nestjs/common';
import {
  AdminServicesController,
  AdminServiceBookingsController,
} from './admin-services.controller';
import { AdminServicesService } from './admin-services.service';

@Module({
  controllers: [AdminServicesController, AdminServiceBookingsController],
  providers: [AdminServicesService],
})
export class AdminServicesModule {}
