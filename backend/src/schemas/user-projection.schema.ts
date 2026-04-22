import { Schema, Types } from 'mongoose';

const yyyyMmDdPattern = /^\d{4}-\d{2}-\d{2}$/;

const ProjectionPointSchema = new Schema(
  {
    date: { type: String, required: true, match: yyyyMmDdPattern },
    predicted_emission: { type: Number, required: true },
  },
  { _id: false },
);

export interface UserProjection {
  user_id: Types.ObjectId;
  based_on_date: string;
  status: 'ready' | 'insufficient_data' | 'failed';
  model_version: string;
  input_days: number;
  next_30_days: Array<{
    date: string;
    predicted_emission: number;
  }>;
  year_end_projection: {
    date: string;
    predicted_emission: number;
  } | null;
  metadata: {
    baseline_emission: number;
    current_avg_emission: number;
    reduction_percent: number;
    eco_action_score: number;
    emission_reduction_tasks: number;
  };
  created_at: Date;
  updated_at: Date;
}

export const UserProjectionSchema = new Schema<UserProjection>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    based_on_date: { type: String, required: true, match: yyyyMmDdPattern },
    status: {
      type: String,
      required: true,
      enum: ['ready', 'insufficient_data', 'failed'],
    },
    model_version: { type: String, required: true },
    input_days: { type: Number, required: true },
    next_30_days: { type: [ProjectionPointSchema], required: true },
    year_end_projection: {
      type: ProjectionPointSchema,
      required: false,
      default: null,
    },
    metadata: {
      type: new Schema(
        {
          baseline_emission: { type: Number, required: true },
          current_avg_emission: { type: Number, required: true },
          reduction_percent: { type: Number, required: true },
          eco_action_score: { type: Number, required: true },
          emission_reduction_tasks: { type: Number, required: true },
        },
        { _id: false },
      ),
      required: true,
    },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
  },
  {
    collection: 'user_projections',
    versionKey: false,
  },
);

UserProjectionSchema.index({ user_id: 1, based_on_date: 1 }, { unique: true });
UserProjectionSchema.index({ user_id: 1, updated_at: -1 });