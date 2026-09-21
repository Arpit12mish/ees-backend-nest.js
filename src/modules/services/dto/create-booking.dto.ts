import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, {
    message:
      'phone must be a valid phone number (7–15 digits, optional leading +)',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message?: string;
}
