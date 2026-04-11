import { Schema, Types } from 'mongoose';

export interface UserBadge {
  user_id: Types.ObjectId;
  badge_id: string;
  awarded_at: Date;
}

export const UserBadgeSchema = new Schema<UserBadge>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    badge_id: { type: String, required: true },
    awarded_at: { type: Date, required: true },
  },
  {
    collection: 'user_badges',
    versionKey: false,
  },
);

UserBadgeSchema.index({ user_id: 1, badge_id: 1 }, { unique: true });
