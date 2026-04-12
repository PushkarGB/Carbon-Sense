import { Schema, Types } from 'mongoose';

const yyyyMmDdPattern = /^\d{4}-\d{2}-\d{2}$/;

const TaskStatsSchema = new Schema(
  {
    eco_action: { type: Number, required: true },
    emission_reduction: { type: Number, required: true },
    awareness: { type: Number, required: true },
  },
  { _id: false },
);

const PerformanceMetricsSchema = new Schema(
  {
    baseline_emission: { type: Number, required: true },
    baseline_status: {
      type: String,
      required: true,
      enum: ['pending', 'locked'],
    },
    current_avg_emission: { type: Number, required: true },
    reduction_percent: { type: Number, required: true },
  },
  { _id: false },
);

const BehaviorProfileSchema = new Schema(
  {
    avg_transport_mode: { type: String, required: true },
    avg_distance: { type: Number, required: true },
    avg_ac_hours: { type: Number, required: true },
    avg_energy_usage: { type: Number, required: true },
    eco_action_score: { type: Number, required: true },
  },
  { _id: false },
);

const EngagementMetricsSchema = new Schema(
  {
    task_completion_rate: { type: Number, required: true },
    total_days_logged: { type: Number, required: true },
    app_open_count: { type: Number, required: true },
  },
  { _id: false },
);

const WeeklyInsightsSchema = new Schema(
  {
    total_weeks_logged: { type: Number, required: true },
    last_weekly_submission_date: {
      type: String,
      required: true,
      match: yyyyMmDdPattern,
    },
    latest_weekly_emission: { type: Number, required: true },
    average_weekly_emission: { type: Number, required: true },
    emission_trend: {
      type: String,
      required: true,
      enum: ['increasing', 'stable', 'decreasing'],
    },
    avg_transport_mode: { type: String, required: true },
    avg_distance: { type: Number, required: true },
    avg_ac_hours: { type: Number, required: true },
    avg_energy_usage: { type: Number, required: true },
    eco_action_score: { type: Number, required: true },
    diet_non_veg_day_fraction: { type: Number, required: true },
  },
  { _id: false },
);

export interface UserProfile {
  user_id: Types.ObjectId;
  onboarding_completed: boolean;
  streak_days: number;
  last_submission_date: string;
  last_streak_update: string;
  task_stats: {
    eco_action: number;
    emission_reduction: number;
    awareness: number;
  };
  performance_metrics: {
    baseline_emission: number;
    baseline_status: 'pending' | 'locked';
    current_avg_emission: number;
    reduction_percent: number;
  };
  behavior_profile: {
    avg_transport_mode: string;
    avg_distance: number;
    avg_ac_hours: number;
    avg_energy_usage: number;
    eco_action_score: number;
  };
  engagement_metrics: {
    task_completion_rate: number;
    total_days_logged: number;
    app_open_count: number;
  };
  weekly_insights: {
    total_weeks_logged: number;
    last_weekly_submission_date: string;
    latest_weekly_emission: number;
    average_weekly_emission: number;
    emission_trend: 'increasing' | 'stable' | 'decreasing';
    avg_transport_mode: string;
    avg_distance: number;
    avg_ac_hours: number;
    avg_energy_usage: number;
    eco_action_score: number;
    diet_non_veg_day_fraction: number;
  };
  created_at: Date;
  updated_at: Date;
}

export const UserProfileSchema = new Schema<UserProfile>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    onboarding_completed: { type: Boolean, required: true },
    streak_days: { type: Number, required: true },
    last_submission_date: {
      type: String,
      required: true,
      match: yyyyMmDdPattern,
    },
    last_streak_update: {
      type: String,
      required: true,
      match: yyyyMmDdPattern,
    },
    task_stats: { type: TaskStatsSchema, required: true },
    performance_metrics: {
      type: PerformanceMetricsSchema,
      required: true,
    },
    behavior_profile: { type: BehaviorProfileSchema, required: true },
    engagement_metrics: { type: EngagementMetricsSchema, required: true },
    weekly_insights: { type: WeeklyInsightsSchema, required: true },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
  },
  {
    collection: 'user_profiles',
    versionKey: false,
  },
);

UserProfileSchema.index({ user_id: 1 }, { unique: true });

