import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { FaqEntityType } from '@prisma/client';

export class CreateFaqDto {
  @IsEnum(FaqEntityType)
  entityType: FaqEntityType;

  @ValidateIf((dto: CreateFaqDto) => dto.entityType !== FaqEntityType.GLOBAL)
  @IsString()
  @IsNotEmpty()
  entityId?: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
