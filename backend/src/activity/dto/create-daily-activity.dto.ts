import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const yyyyMmDdPattern = /^\d{4}-\d{2}-\d{2}$/;

class TransportDto {
  @IsIn(['bike', 'car', 'bus', 'metro', 'walk'] as const)
  mode: 'bike' | 'car' | 'bus' | 'metro' | 'walk';

  @IsNumber()
  @Min(0)
  distance: number;
}

class ElectricityDto {
  @IsNumber()
  @Min(0)
  units_consumed: number;

  @IsNumber()
  @Min(0)
  ac_hours: number;
}

class FoodDto {
  @IsIn(['veg', 'non_veg', 'mixed'] as const)
  diet_type: 'veg' | 'non_veg' | 'mixed';

  @IsNumber()
  @Min(0)
  meals_count: number;
}

class WasteDto {
  @IsBoolean()
  segregation: boolean;

  @IsNumber()
  @Min(0)
  bags_used: number;
}

export class CreateDailyActivityDto {
  @IsString()
  @Matches(yyyyMmDdPattern)
  date: string;

  @ValidateNested()
  @Type(() => TransportDto)
  transport: TransportDto;

  @ValidateNested()
  @Type(() => ElectricityDto)
  electricity: ElectricityDto;

  @ValidateNested()
  @Type(() => FoodDto)
  food: FoodDto;

  @ValidateNested()
  @Type(() => WasteDto)
  waste: WasteDto;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  eco_actions: string[];
}
