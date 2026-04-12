import { Schema } from 'mongoose';

const stringOrNull = (value: unknown): boolean =>
  value === null || typeof value === 'string';
const isInteger = (value: unknown): boolean =>
  typeof value === 'number' && Number.isInteger(value);

export interface TaskTemplate {
  task_id: string;
  category: 'system' | 'eco_action' | 'emission_reduction' | 'awareness';
  title: string;
  description: string;
  completion_type: 'auto' | 'manual' | 'hybrid';
  evaluation_logic: string | null;
  conditions: Record<string, unknown>;
  cooldown_days: number;
  priority: number;
  active: boolean;
}

export const TaskTemplateSchema = new Schema<TaskTemplate>(
  {
    task_id: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['system', 'eco_action', 'emission_reduction', 'awareness'],
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    completion_type: {
      type: String,
      required: true,
      enum: ['auto', 'manual', 'hybrid'],
    },
    evaluation_logic: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: stringOrNull,
      },
    },
    conditions: { type: Schema.Types.Mixed, required: true },
    cooldown_days: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: isInteger,
      },
    },
    priority: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: isInteger,
      },
    },
    active: { type: Boolean, required: true },
  },
  {
    collection: 'task_templates',
    versionKey: false,
  },
);
