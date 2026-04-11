import { Schema } from 'mongoose';

export interface JobLog {
  job_id: string;
  type: 'TASK_RESET' | 'LEADERBOARD' | 'BADGE_RETRY';
  status: 'success' | 'failed';
  retry_count: number;
  payload: Record<string, unknown>;
  error_message: string;
  created_at: Date;
  updated_at: Date;
}

export const JobLogSchema = new Schema<JobLog>(
  {
    job_id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['TASK_RESET', 'LEADERBOARD', 'BADGE_RETRY'],
    },
    status: { type: String, required: true, enum: ['success', 'failed'] },
    retry_count: { type: Number, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    error_message: { type: String, required: true },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
  },
  {
    collection: 'job_logs',
    versionKey: false,
  },
);

