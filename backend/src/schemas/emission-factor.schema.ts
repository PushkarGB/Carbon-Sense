import { Schema } from 'mongoose';

export interface EmissionFactor {
  type: 'electricity' | 'petrol' | 'diesel' | 'transport';
  value: number;
  unit: 'kg_co2_per_unit';
  source: string;
  updated_at: Date;
}

export const EmissionFactorSchema = new Schema<EmissionFactor>(
  {
    type: {
      type: String,
      required: true,
      enum: ['electricity', 'petrol', 'diesel', 'transport'],
    },
    value: { type: Number, required: true },
    unit: { type: String, required: true, enum: ['kg_co2_per_unit'] },
    source: { type: String, required: true },
    updated_at: { type: Date, required: true },
  },
  {
    collection: 'emission_factors',
    versionKey: false,
  },
);

