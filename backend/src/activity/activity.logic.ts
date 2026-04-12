import { TaskTemplate } from '../schemas/task-template.schema';

export const INDIA_TIME_ZONE = 'Asia/Kolkata';

const FOOD_FACTORS = {
  non_veg: 3.0,
  veg: 1.5,
} as const;
const WASTE_FACTOR = 0.5;
export const REQUIRED_EMISSION_FACTOR_TYPES = [
  'electricity',
  'transport_car',
  'transport_bike',
  'transport_bus',
  'transport_metro',
  'transport_walk',
] as const;

export interface EmissionFactorValues {
  electricity: number;
  transport_car: number;
  transport_bike: number;
  transport_bus: number;
  transport_metro: number;
  transport_walk: number;
}

export interface ActivityTransportInput {
  mode: 'bike' | 'car' | 'bus' | 'metro' | 'walk';
  distance: number;
}

export interface ActivityElectricityInput {
  units_consumed: number;
  ac_hours: number;
}

export interface ActivityFoodInput {
  diet_type: 'veg' | 'non_veg' | 'mixed';
  meals_count: number;
}

export interface ActivityWasteInput {
  segregation: boolean;
  bags_used: number;
}

export interface ActivityInput {
  date: string;
  transport: ActivityTransportInput;
  electricity: ActivityElectricityInput;
  food: ActivityFoodInput;
  waste: ActivityWasteInput;
  eco_actions: string[];
}

export interface EmissionBreakdown {
  transport: number;
  electricity: number;
  food: number;
  waste: number;
}

export interface EmissionCalculationResult {
  breakdown: EmissionBreakdown;
  totalEmission: number;
}

export interface TaskEvaluationContext {
  submissionType: 'daily' | 'weekly';
  activity: ActivityInput;
  baselineEmission: number;
  currentAverageEmission: number;
  yesterdayEmission: number;
  latestEmission: number;
  profileAverageAcHours: number;
  profileAverageDistance: number;
  /**
   * Mean `transport.distance` on prior daily logs where `transport.mode === 'walk'`
   * (up to 7 most recent days before submission date). Matches Task Template Master List
   * `transport_walk`: today's walked distance must exceed this baseline.
   */
  profileAverageWalkDistance: number;
  recentVehicleDistanceAverage: number;
}

export function getDateStringInTimeZone(
  date: Date,
  timeZone = INDIA_TIME_ZONE,
): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Unable to format date');
  }

  return `${year}-${month}-${day}`;
}

export function calculateDailyEmission(
  activity: ActivityInput,
  factors: EmissionFactorValues,
): EmissionCalculationResult {
  const electricity =
    activity.electricity.units_consumed * factors.electricity;
  const transport = calculateTransportEmission(activity.transport, factors);
  const food = calculateFoodEmission(activity.food);
  const waste = activity.waste.bags_used * WASTE_FACTOR;

  return {
    breakdown: {
      electricity,
      food,
      transport,
      waste,
    },
    totalEmission: electricity + transport + food + waste,
  };
}

export function evaluateTaskCompletion(
  task: Pick<TaskTemplate, 'task_id' | 'completion_type'>,
  context: TaskEvaluationContext,
): boolean {
  if (
    task.completion_type !== 'auto' &&
    task.completion_type !== 'hybrid'
  ) {
    return false;
  }

  if (context.submissionType === 'weekly') {
    return task.task_id === 'weekly_input';
  }

  switch (task.task_id) {
    case 'daily_input':
      return true;
    case 'weekly_input':
      return false;
    case 'transport_public':
      return (
        context.activity.transport.mode === 'bus' ||
        context.activity.transport.mode === 'metro'
      );
    case 'transport_walk':
      return (
        context.activity.transport.mode === 'walk' &&
        context.activity.transport.distance >
          context.profileAverageWalkDistance
      );
    case 'ac_reduce':
      return (
        context.activity.electricity.ac_hours < context.profileAverageAcHours
      );
    case 'fuel_save':
      return (
        context.activity.transport.distance < context.profileAverageDistance
      );
    case 'short_trip_replace':
      return (
        context.activity.transport.mode === 'walk' &&
        context.recentVehicleDistanceAverage > 0 &&
        context.activity.transport.distance <
          context.recentVehicleDistanceAverage
      );
    case 'beat_yesterday':
      return (
        context.yesterdayEmission > 0 &&
        context.latestEmission < context.yesterdayEmission
      );
    case 'below_average':
      return (
        context.currentAverageEmission > 0 &&
        context.latestEmission < context.currentAverageEmission
      );
    case 'low_impact_day':
      // Template text: emission below threshold — v1 uses 80% of locked baseline emission.
      return (
        context.baselineEmission > 0 &&
        context.latestEmission < context.baselineEmission * 0.8
      );
    default:
      return false;
  }
}

function calculateTransportEmission(
  transport: ActivityTransportInput,
  factors: EmissionFactorValues,
): number {
  return transport.distance * factors[transportFactorKeyMap[transport.mode]];
}

function calculateFoodEmission(food: ActivityFoodInput): number {
  if (food.diet_type === 'veg') {
    return food.meals_count * FOOD_FACTORS.veg;
  }

  if (food.diet_type === 'non_veg') {
    return food.meals_count * FOOD_FACTORS.non_veg;
  }

  const splitMeals = food.meals_count / 2;
  return (
    splitMeals * FOOD_FACTORS.veg + splitMeals * FOOD_FACTORS.non_veg
  );
}

const transportFactorKeyMap = {
  bike: 'transport_bike',
  bus: 'transport_bus',
  car: 'transport_car',
  metro: 'transport_metro',
  walk: 'transport_walk',
} as const satisfies Record<
  ActivityTransportInput['mode'],
  keyof EmissionFactorValues
>;
