import { Schema } from 'mongoose';

export interface AqiData {
  city: string;
  station?: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  fetched_at: Date;
}

export const AqiDataSchema = new Schema<AqiData>(
  {
    city: { type: String, required: true },
    station: { type: String, required: false },
    aqi: { type: Number, required: true },
    pm25: { type: Number, required: true },
    pm10: { type: Number, required: true },
    no2: { type: Number, required: true },
    so2: { type: Number, required: true },
    co: { type: Number, required: true },
    fetched_at: { type: Date, required: true },
  },
  {
    collection: 'aqi_data',
    versionKey: false,
  },
);

