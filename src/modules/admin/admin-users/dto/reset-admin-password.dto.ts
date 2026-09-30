import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResetAdminPasswordDto {
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  password: string;
}
