import { Schema } from 'mongoose';

export interface Badge {
  badge_id: string;
  name: string;
  description: string;
  category:
    | 'eco_action'
    | 'emission_reduction'
    | 'awareness'
    | 'streak'
    | 'performance';
  type: 'task' | 'streak' | 'performance';
  threshold: number;
  value: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon_url: string;
  active: boolean;
}

export const BadgeSchema = new Schema<Badge>(
  {
    badge_id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'eco_action',
        'emission_reduction',
        'awareness',
        'streak',
        'performance',
      ],
    },
    type: {
      type: String,
      required: true,
      enum: ['task', 'streak', 'performance'],
    },
    threshold: { type: Number, required: true },
    value: { type: Number, required: true },
    tier: {
      type: String,
      required: true,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
    },
    icon_url: { type: String, required: true },
    active: { type: Boolean, required: true },
  },
  {
    collection: 'badges',
    versionKey: false,
  },
);

