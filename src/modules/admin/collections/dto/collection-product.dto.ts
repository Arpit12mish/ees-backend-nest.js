import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsArray,
  ArrayNotEmpty,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddCollectionProductDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}

export class BulkAddCollectionProductsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  productIds: string[];
}

export class ReorderCollectionProductDto {
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder: number;
}
