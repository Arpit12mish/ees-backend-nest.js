import {
  IsString,
  IsInt,
  IsNotEmpty,
  Min,
  IsOptional,
  IsEmail,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsEmail()
  userEmail?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]{7,20}$/)
  userPhone?: string;
}

export class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}
