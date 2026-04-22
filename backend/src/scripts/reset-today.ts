import { connect, connection } from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DailyActivityLogSchema } from '../schemas/daily-activity-log.schema';
import { UserDailyTaskSchema } from '../schemas/user-daily-task.schema';
import { UserProfileSchema } from '../schemas/user-profile.schema';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function reset() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/carbonsense';
  await connect(uri);
  console.log('Connected.\n');

  const DailyActivityLogModel = connection.model('DailyActivityLog', DailyActivityLogSchema);
  const UserDailyTaskModel = connection.model('UserDailyTask', UserDailyTaskSchema);
  const UserProfileModel = connection.model('UserProfile', UserProfileSchema);

  const today = '2026-04-22';
  
  const dLogRes = await DailyActivityLogModel.deleteMany({ date: today, type: 'daily' });
  console.log(`Deleted ${dLogRes.deletedCount} daily logs for today.`);

  const uTaskRes = await UserDailyTaskModel.deleteMany({ date: today });
  console.log(`Deleted ${uTaskRes.deletedCount} user daily tasks for today.`);
  
  const pRes = await UserProfileModel.updateMany({}, {
    $set: { last_submission_date: '1970-01-01', consecutive_submission_days: 0 }
  });
  console.log(`Reset last_submission_date for ${pRes.modifiedCount} profiles.`);

  await connection.close();
}

reset().catch(console.error);
