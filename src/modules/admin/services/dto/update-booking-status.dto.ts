import { IsEnum } from 'class-validator';
import { ServiceBookingStatus } from '@prisma/client';

export class UpdateBookingStatusDto {
  @IsEnum(ServiceBookingStatus)
  status: ServiceBookingStatus;
}
