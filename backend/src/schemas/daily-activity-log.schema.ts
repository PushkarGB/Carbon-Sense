import { Schema, Types } from 'mongoose';

const yyyyMmDdPattern = /^\d{4}-\d{2}-\d{2}$/;

const TransportSchema = new Schema(
  {
    mode: {
      type: String,
      required: true,
      enum: ['bike', 'car', 'bus', 'metro', 'walk'],
    },
    distance: { type: Number, required: true },
  },
  { _id: false },
);

const ElectricitySchema = new Schema(
  {
    units_consumed: { type: Number, required: true },
    ac_hours: { type: Number, required: true },
  },
  { _id: false },
);

const FoodSchema = new Schema(
  {
    diet_type: {
      type: String,
      required: true,
      enum: ['veg', 'non_veg', 'mixed'],
    },
    meals_count: { type: Number, required: true },
  },
  { _id: false },
);

const WasteSchema = new Schema(
  {
    segregation: { type: Boolean, required: true },
    bags_used: { type: Number, required: true },
  },
  { _id: false },
);

export interface DailyActivityLog {
  user_id: Types.ObjectId;
  date: string;
  type: 'daily' | 'weekly';
  transport: {
    mode: 'bike' | 'car' | 'bus' | 'metro' | 'walk';
    distance: number;
  };
  electricity: {
    units_consumed: number;
    ac_hours: number;
  };
  food: {
    diet_type: 'veg' | 'non_veg' | 'mixed';
    meals_count: number;
  };
  waste: {
    segregation: boolean;
    bags_used: number;
  };
  eco_actions: string[];
  created_at: Date;
}

export const DailyActivityLogSchema = new Schema<DailyActivityLog>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    date: {
      type: String,
      required: true,
      match: yyyyMmDdPattern,
      immutable: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['daily', 'weekly'],
      immutable: true,
    },
    transport: { type: TransportSchema, required: true, immutable: true },
    electricity: { type: ElectricitySchema, required: true, immutable: true },
    food: { type: FoodSchema, required: true, immutable: true },
    waste: { type: WasteSchema, required: true, immutable: true },
    eco_actions: { type: [String], required: true, immutable: true },
    created_at: { type: Date, required: true, immutable: true },
  },
  {
    collection: 'daily_activity_logs',
    versionKey: false,
  },
);

DailyActivityLogSchema.index({ user_id: 1, date: 1, type: 1 }, { unique: true });
