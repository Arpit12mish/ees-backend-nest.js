import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AnalyticsEventType } from '@prisma/client';

export class TrackEventDto {
  @IsEnum(AnalyticsEventType)
  type: AnalyticsEventType;

  @IsString()
  @IsNotEmpty()
  visitorId: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  path?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  collectionId?: string;

  @ValidateIf((o: TrackEventDto) => o.type === AnalyticsEventType.SEARCH)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  searchQuery?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  resultCount?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
