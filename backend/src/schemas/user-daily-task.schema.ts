import { Schema, Types } from 'mongoose';

const yyyyMmDdPattern = /^\d{4}-\d{2}-\d{2}$/;
const dateOrNull = (value: unknown): boolean =>
  value === null || value instanceof Date;

const UserDailyTaskItemSchema = new Schema(
  {
    task_id: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, required: true, enum: ['pending', 'completed'] },
    completion_type: {
      type: String,
      required: true,
      enum: ['auto', 'manual', 'hybrid'],
    },
    completed_at: {
      type: Schema.Types.Mixed,
      default: null,
      validate: {
        validator: dateOrNull,
      },
    },
  },
  { _id: false },
);

export interface UserDailyTask {
  user_id: Types.ObjectId;
  date: string;
  tasks: Array<{
    task_id: string;
    category: string;
    status: 'pending' | 'completed';
    completion_type: 'auto' | 'manual' | 'hybrid';
    completed_at: Date | null;
  }>;
  created_at: Date;
}

export const UserDailyTaskSchema = new Schema<UserDailyTask>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true, match: yyyyMmDdPattern },
    tasks: { type: [UserDailyTaskItemSchema], required: true },
    created_at: { type: Date, required: true },
  },
  {
    collection: 'user_daily_tasks',
    versionKey: false,
  },
);

UserDailyTaskSchema.index({ user_id: 1, date: 1 }, { unique: true });
