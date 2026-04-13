import { IsEnum, IsNumber, Max, Min } from 'class-validator';

const TRANSPORT_MODES = ['bike', 'car', 'bus', 'metro', 'walk'] as const;
const DIET_TYPES = ['veg', 'non_veg', 'mixed'] as const;

export class CompleteOnboardingDto {
  @IsEnum(TRANSPORT_MODES)
  transport_mode: (typeof TRANSPORT_MODES)[number];

  @IsNumber()
  @Min(0)
  @Max(200)
  avg_daily_distance_km: number;

  @IsNumber()
  @Min(0)
  @Max(50)
  electricity_units_per_day: number;

  @IsNumber()
  @Min(0)
  @Max(24)
  ac_hours_per_day: number;

  @IsEnum(DIET_TYPES)
  diet_type: (typeof DIET_TYPES)[number];

  @IsNumber()
  @Min(1)
  @Max(10)
  meals_per_day: number;

  @IsNumber()
  @Min(0)
  @Max(20)
  waste_bags_per_day: number;
}
