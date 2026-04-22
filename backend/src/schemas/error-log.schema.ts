import { Schema, Types } from 'mongoose';

export interface ErrorLog {
  error_id: string;
  type: 'CRITICAL' | 'NON_CRITICAL';
  module: 'submission' | 'badge' | 'task' | 'leaderboard' | 'projection';
  user_id: Types.ObjectId;
  message: string;
  payload: Record<string, unknown>;
  retry_count: number;
  timestamp: Date;
}

export const ErrorLogSchema = new Schema<ErrorLog>(
  {
    error_id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['CRITICAL', 'NON_CRITICAL'],
    },
    module: {
      type: String,
      required: true,
      enum: ['submission', 'badge', 'task', 'leaderboard', 'projection'],
    },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    retry_count: { type: Number, required: true },
    timestamp: { type: Date, required: true },
  },
  {
    collection: 'error_logs',
    versionKey: false,
  },
);
