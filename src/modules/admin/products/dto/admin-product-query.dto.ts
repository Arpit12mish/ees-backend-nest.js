import {
  IsOptional,
  IsEnum,
  IsString,
  IsInt,
  IsBoolean,
  Min,
  IsIn,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ProductStatus } from '@prisma/client';

export class AdminProductQueryDto {
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  // When no explicit status filter is given, the list excludes INACTIVE
  // (deactivated/"deleted") products by default. Pass this to see them too.
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeInactive?: boolean;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn([
    'newest',
    'oldest',
    'price_low_to_high',
    'price_high_to_low',
    'priority',
  ])
  sort?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
