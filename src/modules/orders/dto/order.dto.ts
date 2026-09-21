import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsObject,
  ValidateNested,
  IsOptional,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  line1: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  pincode: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s()]{7,20}$/)
  customerPhone: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;
}
