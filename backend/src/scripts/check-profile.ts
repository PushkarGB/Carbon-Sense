import { connect, connection } from 'mongoose';
import { UserProfileSchema } from '../schemas/user-profile.schema';
import { UserBadgeSchema } from '../schemas/user-badge.schema';
import { BadgeSchema } from '../schemas/badge.schema';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function check() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/carbonsense';
  await connect(uri);
  console.log('Connected.\n');

  const ProfileModel = connection.model('UserProfile', UserProfileSchema);
  const UserBadgeModel = connection.model('UserBadge', UserBadgeSchema);
  const BadgeModel = connection.model('Badge', BadgeSchema);

  // Get all profiles
  const profiles = await ProfileModel.find({}).lean().exec();
  console.log(`Found ${profiles.length} user profile(s):\n`);

  for (const p of profiles) {
    console.log(`  user_id: ${p.user_id}`);
    console.log(`  task_stats:`, JSON.stringify(p.task_stats));
    console.log(`  engagement_metrics:`, JSON.stringify(p.engagement_metrics));
    console.log(`  streak_days: ${p.streak_days}`);
    console.log(`  last_submission_date: ${p.last_submission_date}`);
    console.log(`  consecutive_submission_days: ${p.consecutive_submission_days}`);

    // Check user badges
    const awarded = await UserBadgeModel.find({ user_id: p.user_id }).lean().exec();
    console.log(`  awarded_badges: [${awarded.map(b => b.badge_id).join(', ')}]`);
    console.log('');
  }

  // Check badge templates
  const badges = await BadgeModel.find({ active: true }).lean().exec();
  console.log(`\nBadge templates (${badges.length}):`);
  for (const b of badges) {
    console.log(`  ${b.badge_id} | category: ${b.category} | threshold: ${b.threshold}`);
  }

  await connection.close();
}

check().catch(console.error);
