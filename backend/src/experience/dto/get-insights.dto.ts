import { Type } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

export class GetInsightsDto {
  @IsOptional()
  @Type(() => Number)
  @IsIn([7, 30] as const)
  range_days?: 7 | 30;
}
