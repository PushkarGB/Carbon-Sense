import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { UserSchema } from '../schemas/user.schema';
import { UserProfileSchema } from '../schemas/user-profile.schema';
import { DailyActivityLogSchema } from '../schemas/daily-activity-log.schema';
import { CarbonRecordSchema } from '../schemas/carbon-record.schema';
import { UserBadgeSchema } from '../schemas/user-badge.schema';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/carbonsense';

const usersData = [
  { name: 'Vaishnavi', email: 'vaishnavi@example.com', role: 'student', city: 'Pune', state: 'Maharashtra', avatar: 'https://i.pravatar.cc/150?u=vaishnavi' },
  { name: 'Diksha', email: 'diksha@example.com', role: 'student', city: 'Pune', state: 'Maharashtra', avatar: 'https://i.pravatar.cc/150?u=diksha' },
  { name: 'Rahul', email: 'rahul@example.com', role: 'working_professional', city: 'Pune', state: 'Maharashtra', avatar: 'https://i.pravatar.cc/150?img=11' },
  { name: 'Neha', email: 'neha@example.com', role: 'working_professional', city: 'Pune', state: 'Maharashtra', avatar: 'https://i.pravatar.cc/150?img=5' },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const User = mongoose.model('User', UserSchema);
  const UserProfile = mongoose.model('UserProfile', UserProfileSchema);
  const DailyActivityLog = mongoose.model('DailyActivityLog', DailyActivityLogSchema);
  const CarbonRecord = mongoose.model('CarbonRecord', CarbonRecordSchema);
  const UserBadge = mongoose.model('UserBadge', UserBadgeSchema);

  const password_hash = await bcrypt.hash('password123', 10);

  // Define date sequence (last 8 days ending today)
  const today = new Date();
  const dates: Date[] = [];
  for(let i=7; i>=0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d);
  }

  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  for (const ud of usersData) {
    console.log(`Seeding user: ${ud.name} (${ud.email})`);
    
    // Clear old data for this email if exists
    const existing = await User.findOne({ email: ud.email });
    if (existing) {
      await UserProfile.deleteOne({ user_id: existing._id });
      await DailyActivityLog.deleteMany({ user_id: existing._id });
      await CarbonRecord.deleteMany({ user_id: existing._id });
      await UserBadge.deleteMany({ user_id: existing._id });
      await User.deleteOne({ _id: existing._id });
    }

    const created_at = dates[0]; // 8 days ago
    
    const user = await User.create({
      name: ud.name,
      email: ud.email,
      password_hash,
      role: ud.role,
      city: ud.city,
      state: ud.state,
      profile_picture_url: ud.avatar,
      created_at,
      updated_at: today,
    });

    let totalEmissionAcc = 0;

    for (let i = 0; i < dates.length; i++) {
      const d = dates[i];
      const dateStr = formatDate(d);
      
      // Randomize values reasonably
      const dist = ud.role === 'student' ? 5 + Math.random()*10 : 15 + Math.random()*20;
      const ac = 1 + Math.random()*3;
      
      // Breakdown emissions approx (kg CO2e)
      const tE = dist * 0.15; // transport
      const eE = ac * 0.8; // electricity
      const fE = 2.5; // food
      const wE = 0.5; // waste
      const dailyTotal = tE + eE + fE + wE;
      
      totalEmissionAcc += dailyTotal;

      await DailyActivityLog.create({
        user_id: user._id,
        date: dateStr,
        type: 'daily',
        transport: { mode: ud.role==='student'?'bus':'car', distance: dist },
        electricity: { units_consumed: ac*1.5, ac_hours: ac },
        food: { diet_type: 'mixed', meals_count: 3 },
        waste: { segregation: true, bags_used: 1 },
        eco_actions: i % 2 === 0 ? ['used_public_transport'] : [],
        created_at: d,
      });

      await CarbonRecord.create({
        user_id: user._id,
        date: dateStr,
        total_emission: dailyTotal,
        breakdown: {
          transport: tE,
          electricity: eE,
          food: fE,
          waste: wE,
        },
        created_at: d,
      });
    }

    // Badges
    const badgesToAward = ['first_log', 'streak_3_days', 'streak_7_days'];
    for(const b of badgesToAward) {
      await UserBadge.create({
        user_id: user._id,
        badge_id: b,
        awarded_at: today,
      });
    }

    // Profile
    await UserProfile.create({
      user_id: user._id,
      onboarding_completed: true,
      streak_days: 8,
      consecutive_submission_days: 8,
      last_submission_date: formatDate(today),
      last_streak_update: formatDate(today),
      task_stats: {
        eco_action: 4,
        emission_reduction: 2,
        awareness: 1,
      },
      performance_metrics: {
        baseline_emission: 15, // typical kg CO2 per day
        baseline_status: 'locked',
        current_avg_emission: totalEmissionAcc / 8,
        reduction_percent: 5,
      },
      behavior_profile: {
        avg_transport_mode: ud.role==='student'?'bus':'car',
        avg_distance: ud.role==='student'?10:25,
        avg_ac_hours: 2,
        avg_energy_usage: 5,
        eco_action_score: 50,
      },
      engagement_metrics: {
        task_completion_rate: 80,
        total_tasks_completed: 7,
        total_days_logged: 8,
        app_open_count: 15,
      },
      weekly_insights: {
        total_weeks_logged: 1,
        last_weekly_submission_date: formatDate(dates[6]),
        latest_weekly_emission: totalEmissionAcc,
        average_weekly_emission: totalEmissionAcc,
        emission_trend: 'stable',
        avg_transport_mode: ud.role==='student'?'bus':'car',
        avg_distance: ud.role==='student'?10:25,
        avg_ac_hours: 2,
        avg_energy_usage: 5,
        eco_action_score: 50,
        diet_non_veg_day_fraction: 0.3,
      },
      onboarding_defaults: {
        transport_mode: ud.role==='student'?'bus':'car',
        avg_daily_distance_km: ud.role==='student'?10:25,
        electricity_units_per_day: 5,
        ac_hours_per_day: 2,
        diet_type: 'mixed',
        meals_per_day: 3,
        waste_bags_per_day: 1,
      },
      created_at,
      updated_at: today,
    });
  }

  console.log('Seeding complete.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
