import { connect, connection } from 'mongoose';
import { BadgeSchema } from '../schemas/badge.schema';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const badges = [
  // 1.1 Eco Action Badges
  { badge_id: "eco_5", name: "Green Starter", description: "Complete 5 eco action tasks", category: "eco_action", type: "task", threshold: 5, value: 10, tier: "bronze", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000167/carbonsense/badges/eco_5.svg", active: true },
  { badge_id: "eco_15", name: "Eco Explorer", description: "Complete 15 eco action tasks", category: "eco_action", type: "task", threshold: 15, value: 25, tier: "silver", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000164/carbonsense/badges/eco_15.svg", active: true },
  { badge_id: "eco_50", name: "Nature Guardian", description: "Complete 50 eco action tasks", category: "eco_action", type: "task", threshold: 50, value: 60, tier: "gold", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000170/carbonsense/badges/eco_50.svg", active: true },
  { badge_id: "eco_100", name: "Planet Protector", description: "Complete 100 eco action tasks", category: "eco_action", type: "task", threshold: 100, value: 120, tier: "platinum", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000163/carbonsense/badges/eco_100.svg", active: true },

  // 1.2 Emission Reduction Badges
  { badge_id: "emission_5", name: "Smart Mover", description: "Complete 5 emission reduction tasks", category: "emission_reduction", type: "task", threshold: 5, value: 10, tier: "bronze", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000177/carbonsense/badges/emission_5.svg", active: true },
  { badge_id: "emission_15", name: "Carbon Cutter", description: "Complete 15 emission reduction tasks", category: "emission_reduction", type: "task", threshold: 15, value: 25, tier: "silver", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000175/carbonsense/badges/emission_15.svg", active: true },
  { badge_id: "emission_50", name: "Low Impact Pro", description: "Complete 50 emission reduction tasks", category: "emission_reduction", type: "task", threshold: 50, value: 60, tier: "gold", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000178/carbonsense/badges/emission_50.svg", active: true },
  { badge_id: "emission_100", name: "Zero Impact Elite", description: "Complete 100 emission reduction tasks", category: "emission_reduction", type: "task", threshold: 100, value: 120, tier: "platinum", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000172/carbonsense/badges/emission_100.svg", active: true },

  // 1.3 Awareness Badges
  { badge_id: "aware_5", name: "Curious Mind", description: "Complete 5 awareness tasks", category: "awareness", type: "task", threshold: 5, value: 10, tier: "bronze", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000158/carbonsense/badges/aware_5.svg", active: true },
  { badge_id: "aware_15", name: "Insight Seeker", description: "Complete 15 awareness tasks", category: "awareness", type: "task", threshold: 15, value: 25, tier: "silver", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000157/carbonsense/badges/aware_15.svg", active: true },
  { badge_id: "aware_50", name: "Data Driven", description: "Complete 50 awareness tasks", category: "awareness", type: "task", threshold: 50, value: 60, tier: "gold", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000160/carbonsense/badges/aware_50.svg", active: true },
  { badge_id: "aware_100", name: "Climate Analyst", description: "Complete 100 awareness tasks", category: "awareness", type: "task", threshold: 100, value: 120, tier: "platinum", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000155/carbonsense/badges/aware_100.svg", active: true },

  // 2. STREAK BADGES
  { badge_id: "streak_5", name: "Consistency Kickoff", description: "Maintain a 5-day continuous streak", category: "streak", type: "streak", threshold: 5, value: 10, tier: "bronze", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000199/carbonsense/badges/streak_5.svg", active: true },
  { badge_id: "streak_15", name: "Habit Builder", description: "Maintain a 15-day continuous streak", category: "streak", type: "streak", threshold: 15, value: 25, tier: "silver", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000196/carbonsense/badges/streak_15.svg", active: true },
  { badge_id: "streak_30", name: "Unbreakable Flow", description: "Maintain a 30-day continuous streak", category: "streak", type: "streak", threshold: 30, value: 60, tier: "gold", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000197/carbonsense/badges/streak_30.svg", active: true },
  { badge_id: "streak_100", name: "Discipline Master", description: "Maintain a 100-day continuous streak", category: "streak", type: "streak", threshold: 100, value: 120, tier: "platinum", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000194/carbonsense/badges/streak_100.svg", active: true },

  // 3. PERFORMANCE BADGES
  { badge_id: "perf_5", name: "Small Shift", description: "Reduce carbon emission by 5%", category: "performance", type: "performance", threshold: 5, value: 10, tier: "bronze", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000191/carbonsense/badges/perf_5.svg", active: true },
  { badge_id: "perf_10", name: "Conscious Living", description: "Reduce carbon emission by 10%", category: "performance", type: "performance", threshold: 10, value: 25, tier: "silver", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000184/carbonsense/badges/perf_10.svg", active: true },
  { badge_id: "perf_20", name: "Carbon Saver", description: "Reduce carbon emission by 20%", category: "performance", type: "performance", threshold: 20, value: 60, tier: "gold", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000186/carbonsense/badges/perf_20.svg", active: true },
  { badge_id: "perf_35", name: "Climate Warrior", description: "Reduce carbon emission by 35%", category: "performance", type: "performance", threshold: 35, value: 120, tier: "platinum", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000188/carbonsense/badges/perf_35.svg", active: true },
  { badge_id: "perf_50", name: "Earth Champion", description: "Reduce carbon emission by 50%", category: "performance", type: "performance", threshold: 50, value: 150, tier: "platinum", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000192/carbonsense/badges/perf_50.svg", active: true },

  // 4. SPECIAL BADGES
  { badge_id: "first_task", name: "First Step", description: "Complete your first task", category: "eco_action", type: "task", threshold: 1, value: 5, tier: "bronze", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000180/carbonsense/badges/first_task.svg", active: true },
  { badge_id: "perfect_week", name: "Perfect Week", description: "Maintain a 7-day streak", category: "streak", type: "streak", threshold: 7, value: 30, tier: "gold", icon_url: "https://res.cloudinary.com/ddqpxsmxm/image/upload/v1776000182/carbonsense/badges/perfect_week.svg", active: true }
];

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/carbonsense';
  await connect(uri);
  console.log(`Connected to MongoDB at ${uri}...`);

  const BadgeModel = connection.model('Badge', BadgeSchema);

  let inserted = 0;
  let updated = 0;

  for (const badge of badges) {
    const existing = await BadgeModel.findOne({ badge_id: badge.badge_id });
    if (existing) {
      await BadgeModel.updateOne({ badge_id: badge.badge_id }, { $set: badge });
      updated++;
    } else {
      await BadgeModel.create(badge);
      inserted++;
    }
  }

  console.log(`Seed complete: ${inserted} inserted, ${updated} updated. Total: ${badges.length}`);
  await connection.close();
  console.log('MongoDB connection closed.');
}

seed().catch(console.error);
