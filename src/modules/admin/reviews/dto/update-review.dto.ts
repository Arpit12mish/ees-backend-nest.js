import { IsBoolean } from 'class-validator';

export class UpdateReviewDto {
  @IsBoolean()
  isApproved: boolean;
}
