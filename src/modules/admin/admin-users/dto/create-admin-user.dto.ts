import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AdminRole } from '@prisma/client';

export class CreateAdminUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10)
  @MaxLength(200)
  password: string;

  @IsEnum(AdminRole)
  role: AdminRole;
}
