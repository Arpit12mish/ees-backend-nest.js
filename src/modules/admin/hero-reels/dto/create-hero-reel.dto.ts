import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHeroReelDto {
  @IsString()
  @IsNotEmpty()
  videoUrl: string;

  @IsOptional()
  @IsString()
  posterUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  altText?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
