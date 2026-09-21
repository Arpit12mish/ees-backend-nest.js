import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ValidateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  orderAmount?: number;

  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
