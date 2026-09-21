import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateInventoryDto {
  @IsInt()
  @Min(0)
  @Type(() => Number)
  inventoryQuantity: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  lowStockThreshold: number;
}
