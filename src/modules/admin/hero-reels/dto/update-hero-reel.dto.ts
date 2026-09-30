import { PartialType } from '@nestjs/mapped-types';
import { CreateHeroReelDto } from './create-hero-reel.dto';

export class UpdateHeroReelDto extends PartialType(CreateHeroReelDto) {}
