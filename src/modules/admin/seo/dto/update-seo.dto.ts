import { PartialType } from '@nestjs/mapped-types';
import { UpsertSeoDto } from './upsert-seo.dto';

export class UpdateSeoDto extends PartialType(UpsertSeoDto) {}
