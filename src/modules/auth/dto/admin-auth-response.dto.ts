import { AdminRole } from '@prisma/client';

export class AdminAuthProfileDto {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

export class AdminAuthResponseDto {
  accessToken: string;
  admin: AdminAuthProfileDto;
}
