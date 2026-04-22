import { Schema, Types } from 'mongoose';

const yyyyMmDdPattern = /^\d{4}-\d{2}-\d{2}$/;

const BreakdownSchema = new Schema(
  {
    transport: { type: Number, required: true },
    electricity: { type: Number, required: true },
    food: { type: Number, required: true },
    waste: { type: Number, required: true },
  },
  { _id: false },
);

export interface CarbonRecord {
  user_id: Types.ObjectId;
  date: string;
  total_emission: number;
  breakdown: {
    transport: number;
    electricity: number;
    food: number
    waste: number;
  };
  created_at: Date;
}

export const CarbonRecordSchema = new Schema<CarbonRecord>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true, match: yyyyMmDdPattern },
    total_emission: { type: Number, required: true },
    breakdown: { type: BreakdownSchema, required: true },
    created_at: { type: Date, required: true },
  },
  {
    collection: 'carbon_records',
    versionKey: false,
  },
);

