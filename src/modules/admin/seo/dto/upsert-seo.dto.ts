import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { SeoEntityType } from '@prisma/client';

export class UpsertSeoDto {
  @IsEnum(SeoEntityType)
  entityType: SeoEntityType;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(70)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoDescription?: string;

  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(70)
  ogTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  ogDescription?: string;

  @IsOptional()
  @IsString()
  ogImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(70)
  twitterTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  twitterDescription?: string;

  @IsOptional()
  @IsString()
  twitterImageUrl?: string;

  @IsOptional()
  @IsString()
  schemaType?: string;

  @IsOptional()
  @IsBoolean()
  noindex?: boolean;
}
