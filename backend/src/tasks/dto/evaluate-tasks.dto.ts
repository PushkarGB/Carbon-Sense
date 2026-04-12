import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AwarenessSignalsDto {
  @IsOptional()
  @IsBoolean()
  aqi_screen_viewed?: boolean;

  @IsOptional()
  @IsBoolean()
  insights_screen_viewed?: boolean;

  @IsOptional()
  @IsBoolean()
  comparison_viewed?: boolean;

  @IsOptional()
  @IsBoolean()
  trend_viewed?: boolean;
}

export class EvaluateTasksDto {
  @IsOptional()
  @IsString()
  task_id?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AwarenessSignalsDto)
  signals?: AwarenessSignalsDto;
}
