import { Type } from 'class-transformer';
import { IsIn, IsOptional, Max, Min } from 'class-validator';

export class ListLeaderboardDto {
  @IsOptional()
  @IsIn(['global', 'city', 'role'] as const)
  scope?: 'global' | 'city' | 'role';

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;
}
