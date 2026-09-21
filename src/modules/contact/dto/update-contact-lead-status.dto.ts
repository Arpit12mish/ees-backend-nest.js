import { IsEnum } from 'class-validator';
import { ContactLeadStatus } from '@prisma/client';

export class UpdateContactLeadStatusDto {
  @IsEnum(ContactLeadStatus)
  status: ContactLeadStatus;
}
