import { connect, connection } from 'mongoose';
import { EmissionFactorSchema } from '../schemas/emission-factor.schema';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const factors = [
  {
    type: 'electricity',
    value: 0.716,
    unit: 'kg_co2_per_kwh',
    source: 'CEA CO₂ Baseline Database for Indian Power Sector (Version 21)',
    updated_at: new Date(),
  },
  {
    type: 'transport_car',
    value: 0.12,
    unit: 'kg_co2_per_km',
    source: 'WRI India GHG Program - Road Transport Emission Factors',
    updated_at: new Date(),
  },
  {
    type: 'transport_bike',
    value: 0.05,
    unit: 'kg_co2_per_km',
    source: 'WRI India GHG Program - Road Transport Emission Factors',
    updated_at: new Date(),
  },
  {
    type: 'transport_bus',
    value: 0.03,
    unit: 'kg_co2_per_km',
    source: 'WRI India GHG Program - Road Transport Emission Factors',
    updated_at: new Date(),
  },
  {
    type: 'transport_metro',
    value: 0.02,
    unit: 'kg_co2_per_km',
    source: 'WRI India GHG Program - Road Transport Emission Factors',
    updated_at: new Date(),
  },
  {
    type: 'transport_walk',
    value: 0.0,
    unit: 'kg_co2_per_km',
    source: 'Zero emission (walking)',
    updated_at: new Date(),
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/carbonsense';
  await connect(uri);
  console.log(`Connected to MongoDB at ${uri}...`);

  const EmissionFactorModel = connection.model('EmissionFactor', EmissionFactorSchema);

  let inserted = 0;
  let updated = 0;

  for (const factor of factors) {
    const existing = await EmissionFactorModel.findOne({ type: factor.type });
    if (existing) {
      await EmissionFactorModel.updateOne({ type: factor.type }, { $set: factor });
      updated++;
    } else {
      await EmissionFactorModel.create(factor);
      inserted++;
    }
  }

  console.log(`Emission factors seed complete: ${inserted} inserted, ${updated} updated. Total: ${factors.length}`);
  await connection.close();
  console.log('MongoDB connection closed.');
}

seed().catch(console.error);
