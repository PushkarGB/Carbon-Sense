import { connect, connection } from 'mongoose';
import { UserDailyTaskSchema } from '../schemas/user-daily-task.schema';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function check() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/carbonsense';
  await connect(uri);
  console.log('Connected.\n');

  const UserDailyTaskModel = connection.model('UserDailyTask', UserDailyTaskSchema);

  const tasks = await UserDailyTaskModel.find({}).lean().exec();
  console.log(`Found ${tasks.length} user daily tasks:\n`);

  for (const t of tasks) {
    console.log(`  user_id: ${t.user_id}, date: ${t.date}`);
    console.log(`  tasks:`, JSON.stringify(t.tasks));
    console.log('');
  }

  await connection.close();
}

check().catch(console.error);
