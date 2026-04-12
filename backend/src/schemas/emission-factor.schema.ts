import { Schema } from 'mongoose';

export const emissionFactorTypes = [
  'electricity',
  'transport_car',
  'transport_bike',
  'transport_bus',
  'transport_metro',
  'transport_walk',
] as const;

export type EmissionFactorType = (typeof emissionFactorTypes)[number];

export interface EmissionFactor {
  type: EmissionFactorType;
  value: number;
  unit: string;
  source: string;
  updated_at: Date;
}

export const EmissionFactorSchema = new Schema<EmissionFactor>(
  {
    type: {
      type: String,
      required: true,
      enum: emissionFactorTypes,
    },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    source: { type: String, required: true },
    updated_at: { type: Date, required: true },
  },
  {
    collection: 'emission_factors',
    versionKey: false,
  },
);

