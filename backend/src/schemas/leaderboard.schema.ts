import { Schema, Types } from 'mongoose';

export interface Leaderboard {
  user_id: Types.ObjectId;
  avg_emission: number;
  total_emission: number;
  total_days_logged: number;
  city: string;
  role: string;
  updated_at: Date;
}

export const LeaderboardSchema = new Schema<Leaderboard>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    avg_emission: { type: Number, required: true },
    total_emission: { type: Number, required: true },
    total_days_logged: { type: Number, required: true },
    city: { type: String, required: true },
    role: { type: String, required: true },
    updated_at: { type: Date, required: true },
  },
  {
    collection: 'leaderboards',
    versionKey: false,
  },
);

LeaderboardSchema.index({ user_id: 1 }, { unique: true });

